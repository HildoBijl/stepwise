import type { SkillSetupLike } from '@step-wise/skill-setup'
import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters, resolveInitialState } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseReducerActionsInput, type InputExerciseSolution, addAttemptsToState, resolveSolution, deserializeInputExerciseParameters, hasAttempted, serializeInputExerciseParameters } from '../InputExercise'

import type { StepExerciseState, StepExerciseStepState, StepExerciseSplitState, StepExercise, StepExerciseSpec } from './types'
import { ensureStepExerciseSteps } from './preprocessing'
import { getStep } from './support'

// Build a StepExercise from its author-facing spec.
export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
	ensureStepExerciseSteps(spec.metaData.steps)
	return {
		...spec,
		type: 'step',
		generateParameters: example => serializeInputExerciseParameters(resolveExerciseParameters(spec.generateParameters, example)),
		getInitialState: parameters => resolveInitialState<TParameters, StepExerciseState>(spec.getInitialState, deserializeInputExerciseParameters<TParameters>(parameters)),
		processSoloAction: buildStepExerciseSoloReducer(spec),
		processGroupActions: buildStepExerciseGroupReducer(spec),
	}
}

export function buildStepExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): SoloExerciseReducer<InputExerciseAction, StepExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceGroupActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] })
	}
}

export function buildStepExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): GroupExerciseReducer<InputExerciseAction, StepExerciseState> {
	return input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceGroupActions(spec, runtimeInput)
	}
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>): StepExerciseState {
	return ('split' in input.state && input.state.split) ? reduceStepActions(spec, input) : reduceMainProblemActions(spec, input)
}

// Reduce a set of actions for the main problem.
function reduceMainProblemActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>): StepExerciseState {
	const { metaData, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const newState = addAttemptsToState(state, mode, getAttemptingUserIds(actions))

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(userAction.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: userAction.action.input, input: exerciseInput, solution }, 0, 0)
	})

	// If any userAction is correct, or if all gave up, the exercise is done.
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			switch (action.type) {
				case 'input':
					if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
					if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
					return
				case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
					const setup = metaData.skill ?? metaData.setup
					if (setup && isDone && !hasAttempted(state, mode, userId)) updateSkills(setup, false, userId)
					return
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	// Determine the new state.
	if (someCorrect) return { ...newState, solved: true, done: true }
	if (allGaveUp) return nextStep({ ...newState, split: true, step: 0 }, metaData.steps.length)
	return newState
}

// Reduce a set of actions for a step.
function reduceStepActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>): StepExerciseState {
	const { metaData } = spec
	const { state } = input
	const step = getStep(state)
	const skill = metaData.steps[step - 1]
	if (Array.isArray(skill)) return reduceStepWithSubstepsActions(spec, input)
	return reduceStepWithoutSubstepsActions(spec, input)
}

function reduceStepWithoutSubstepsActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>): StepExerciseState {
	const { metaData, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getStep(state)
	const skill = metaData.steps[step - 1] as SkillSetupLike
	const stepState = getStepState(state, step)
	const newStepState = addAttemptsToState(stepState, mode, getAttemptingUserIds(actions))

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(userAction.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: userAction.action.input, input: exerciseInput, solution }, step, 0)
	})

	// If any userAction is correct, or if all gave up, the step is done.
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			switch (action.type) {
				case 'input':
					if (skill) updateSkills(skill, correct[index], userId)
					return
				case 'giveUp':
					if (skill && isDone && !hasAttempted(stepState, mode, userId)) updateSkills(skill, false, userId)
					return
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	// Determine the new state.
	if (someCorrect) return nextStep({ ...state, [step]: { ...newStepState, solved: true, done: true } }, metaData.steps.length)
	if (allGaveUp) return nextStep({ ...state, [step]: { ...newStepState, givenUp: true, done: true } }, metaData.steps.length)
	return { ...state, [step]: newStepState }
}

function reduceStepWithSubstepsActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>): StepExerciseState {
	const { metaData, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getStep(state)
	const skill = metaData.steps[step - 1]
	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubstepsActions call: expected step ${step} to have substeps.`)

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Walk through the substeps and check them one by one.
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const previousStepState = getStepState(state, step)
	const stepState = addAttemptsToState({ ...previousStepState }, mode, getAttemptingUserIds(actions))
	skill.forEach((subskill, index) => {
		// Ignore already completed substeps.
		const substep = index + 1
		if (stepState[`${substep}`]) return

		// Check all input actions.
		const correct = actions.map(userAction => {
			if (userAction.action.type !== 'input') return false
			const exerciseInput = interpretAllInputValues(userAction.action.input) as InputExerciseInput
			const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
			return checkInput({ metaData, parameters, rawInput: userAction.action.input, input: exerciseInput, solution }, step, substep)
		})
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp

		// Run the skill updates for the skill of this step.
		if (updateSkills !== undefined) {
			actions.forEach((userAction, index) => {
				const { action, userId } = userAction
				switch (action.type) {
					case 'input':
						if (subskill) updateSkills(subskill, correct[index], userId)
						return
					case 'giveUp':
						if (subskill && isDone && !hasAttempted(previousStepState, mode, userId)) updateSkills(subskill, false, userId)
						return
					default:
						throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
				}
			})
		}

		// Remember correct substeps.
		if (someCorrect) stepState[`${substep}`] = true
	})

	// Determine the new state, given the substep state.
	const everySubstepSolved = skill.every((_, index) => stepState[`${index + 1}`])
	if (everySubstepSolved) return nextStep({ ...state, [step]: { ...stepState, solved: true, done: true } }, metaData.steps.length)
	if (allGaveUp) return nextStep({ ...state, [step]: { ...stepState, givenUp: true, done: true } }, metaData.steps.length)
	return { ...state, [step]: stepState }
}

// Move state to the next step, or mark the full exercise done.
function nextStep(state: StepExerciseState, numSteps: number): StepExerciseState {
	const step = getStep(state)
	if (step === numSteps) return { ...state, done: true } as StepExerciseState
	const nextStep = step + 1
	return { ...state, split: true, step: nextStep, [nextStep]: {} }
}

// Get a step within the state and ensure it's typed correctly.
function getStepState(state: StepExerciseState, step: number): StepExerciseStepState {
	if (!('split' in state)) throw new Error(`Invalid getStepState call: cannot get the state of a StepExercise that has not been split up yet.`)
	return (state as StepExerciseSplitState)[`${step}`] ?? {}
}

function getAttemptingUserIds(actions: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions']): (string | undefined)[] {
	return actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId)
}
