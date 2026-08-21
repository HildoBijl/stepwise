import type { SkillSetupLike } from '@step-wise/skill-setup'
import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, generateExerciseParameters } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseReducerSubmissionsInput, type Solution, assembleSolution, deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise'

import type { StepExerciseProgress, StepExerciseStepProgress, StepExerciseSplitProgress, StepExercise, StepExerciseSpec } from './types'
import { getStep, hasPreviousInputAtStep } from './support'

// Build a StepExercise from its author-facing spec.
export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
	return {
		...spec,
		type: 'step',
		generateParameters: example => serializeInputExerciseParameters(generateExerciseParameters(spec.generateParameters, example)),
		processSoloAction: buildStepExerciseSoloReducer(spec),
		processGroupActions: buildStepExerciseGroupReducer(spec),
	}
}

export function buildStepExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>): SoloExerciseReducer<InputExerciseAction, StepExerciseProgress> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.progress && runtimeInput.progress.done) return runtimeInput.progress
		return reduceGroupActions(spec, { ...runtimeInput, mode: 'solo', submissions: [{ action: input.action }] })
	}
}

export function buildStepExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>): GroupExerciseReducer<InputExerciseAction, StepExerciseProgress> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters), mode: 'group' as const }
		if ('done' in runtimeInput.progress && runtimeInput.progress.done) return runtimeInput.progress
		return reduceGroupActions(spec, runtimeInput)
	}
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, StepExerciseProgress, TParameters>): StepExerciseProgress {
	return ('split' in input.progress && input.progress.split) ? reduceStepActions(spec, input) : reduceMainProblemActions(spec, input)
}

// Reduce a set of actions for the main problem.
function reduceMainProblemActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, StepExerciseProgress, TParameters>): StepExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { mode, progress, submissions, parameters, history, updateSkills } = input

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: submission.action.input, input: exerciseInput, solution }, 0, 0)
	})

	// If any submission is correct, or if all gave up, the exercise is done.
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			switch (action.type) {
				case 'input':
					if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
					if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
					return
				case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
					if (isDone && !hasPreviousInputAtStep(mode, history, 0, userId)) updateSkills((metaData.skill ?? metaData.setup)!, false, userId)
					return
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	// Determine the new progress.
	if (someCorrect) return { solved: true, done: true }
	if (allGaveUp) return nextStep({ split: true, step: 0 }, metaData.steps.length)
	return progress
}

// Reduce a set of actions for a step.
function reduceStepActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, StepExerciseProgress, TParameters>): StepExerciseProgress {
	const { metaData } = spec
	const { progress } = input
	const step = getStep(progress)
	const skill = metaData.steps[step - 1]
	if (Array.isArray(skill)) return reduceStepWithSubstepsActions(spec, input)
	return reduceStepWithoutSubstepsActions(spec, input)
}

function reduceStepWithoutSubstepsActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, StepExerciseProgress, TParameters>): StepExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { mode, progress, submissions, parameters, history, updateSkills } = input
	const step = getStep(progress)
	const skill = metaData.steps[step - 1] as SkillSetupLike

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: submission.action.input, input: exerciseInput, solution }, step, 0)
	})

	// If any submission is correct, or if all gave up, the step is done.
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			switch (action.type) {
				case 'input':
					if (skill) updateSkills(skill, correct[index], userId)
					return
				case 'giveUp':
					if (skill && isDone && !hasPreviousInputAtStep(mode, history, step, userId)) updateSkills(skill, false, userId)
					return
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	// Determine the new progress.
	if (someCorrect) return nextStep({ ...progress, [step]: { solved: true, done: true } }, metaData.steps.length)
	if (allGaveUp) return nextStep({ ...progress, [step]: { ...getStepProgress(progress, step), givenUp: true, done: true } }, metaData.steps.length)
	return progress
}

function reduceStepWithSubstepsActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, StepExerciseProgress, TParameters>): StepExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { mode, progress, submissions, parameters, history, updateSkills } = input
	const step = getStep(progress)
	const skill = metaData.steps[step - 1]
	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubstepsActions call: expected step ${step} to have substeps.`)

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(parameters) : undefined

	// Walk through the substeps and check them one by one.
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const stepProgress = { ...getStepProgress(progress, step) }
	skill.forEach((subskill, index) => {
		// Ignore already completed substeps.
		const substep = index + 1
		if (stepProgress[`${substep}`]) return

		// Check all input actions.
		const correct = submissions.map(submission => {
			if (submission.action.type !== 'input') return false
			const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
			const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, parameters, exerciseInput) : undefined)
			return checkInput({ metaData, parameters, rawInput: submission.action.input, input: exerciseInput, solution }, step, substep)
		})
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp

		// Run the skill updates for the skill of this step.
		if (updateSkills !== undefined) {
			submissions.forEach((submission, index) => {
				const { action, userId } = submission
				switch (action.type) {
					case 'input':
						if (subskill) updateSkills(subskill, correct[index], userId)
						return
					case 'giveUp':
						if (subskill && isDone && !hasPreviousInputAtStep(mode, history, step, userId)) updateSkills(subskill, false, userId)
						return
					default:
						throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
				}
			})
		}

		// Remember correct substeps.
		if (someCorrect) stepProgress[`${substep}`] = true
	})

	// Determine the new progress, given the substep progress.
	const everySubstepSolved = skill.every((_, index) => stepProgress[`${index + 1}`])
	if (everySubstepSolved) return nextStep({ ...progress, [step]: { ...stepProgress, solved: true, done: true } }, metaData.steps.length)
	if (allGaveUp) return nextStep({ ...progress, [step]: { ...stepProgress, givenUp: true, done: true } }, metaData.steps.length)
	return { ...progress, [step]: stepProgress }
}

// Move progress to the next step, or mark the full exercise done.
function nextStep(progress: StepExerciseProgress, numSteps: number): StepExerciseProgress {
	const step = getStep(progress)
	if (step === numSteps) return { ...progress, done: true } as StepExerciseProgress
	const nextStep = step + 1
	return { ...progress, split: true, step: nextStep, [nextStep]: {} }
}

// Get a step within the progress and ensure it's typed correctly.
function getStepProgress(progress: StepExerciseProgress, step: number): StepExerciseStepProgress {
	if (!('split' in progress)) throw new Error(`Invalid getStepProgress call: cannot get the progress of a StepExercise that has not been split up yet.`)
	return (progress as StepExerciseSplitProgress)[`${step}`] ?? {}
}
