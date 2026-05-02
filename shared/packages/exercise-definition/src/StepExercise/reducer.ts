// import type { SkillSetupLike } from '@step-wise/skill-setup'

// import { toFO } from '../../../../inputTypes'

// import type { ExerciseReducer, ExerciseReducerInput, ExerciseReducerUserInput, ExerciseReducerGroupInput, ExerciseState, GroupExerciseSubmission } from '../Exercise'
// import { type InputExerciseAction, type InputExerciseInput, type Solution, assembleSolution } from '../InputExercise'

// import type { StepExerciseProgress, StepExerciseStepProgress, StepExerciseSplitProgress, StepExercise } from './types'
// import { getStep, hasPreviousInputAtStep } from './utils'

// // Set up the reducer for a StepExercise.
// export function getStepExerciseReducer<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>): ExerciseReducer<InputExerciseAction, StepExerciseProgress, TState> {
// 	return (input: ExerciseReducerInput<InputExerciseAction, StepExerciseProgress, TState>) => {
// 		if ('done' in input.progress && input.progress.done) return input.progress
// 		if ('submissions' in input) return reduceGroupActions(exercise, input)
// 		return reduceUserAction(exercise, input)
// 	}
// }

// // Reduce an action for a single user.
// function reduceUserAction<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerUserInput<InputExerciseAction, StepExerciseProgress, TState> & { action: InputExerciseAction, submissions?: never }): StepExerciseProgress {
// 	return reduceGroupActions(exercise, {
// 		...input,
// 		submissions: [{ action: input.action }],
// 		action: undefined,
// 	} as ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState>)
// }

// // Reduce a set of actions for a group of users.
// function reduceGroupActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState> & { submissions: GroupExerciseSubmission<InputExerciseAction>[], action?: never }): StepExerciseProgress {
// 	if ('split' in input.progress && input.progress.split) return reduceStepActions(exercise, input)
// 	return reduceMainProblemActions(exercise, input)
// }

// // Reduce a set of actions for the main problem.
// function reduceMainProblemActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState>): StepExerciseProgress {
// 	const { metaData, checkInput, getSolution } = exercise
// 	const { progress, submissions, state, history, updateSkills } = input

// 	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
// 	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

// 	// Check all input actions.
// 	const correct = submissions.map(submission => {
// 		if (submission.action.type !== 'input') return false
// 		const exerciseInput = toFO(submission.action.input, true) as InputExerciseInput
// 		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
// 		return checkInput({ state, input: exerciseInput, solution, metaData }, 0, 0)
// 	})

// 	// If any submission is correct, or if all gave up, the exercise is done.
// 	const someCorrect = correct.some(isCorrect => isCorrect)
// 	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
// 	const isDone = someCorrect || allGaveUp
// 	submissions.forEach((submission, index) => {
// 		const { action, userId } = submission
// 		switch (action.type) {
// 			case 'input':
// 				if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
// 				if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
// 				return
// 			case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
// 				if (isDone && !hasPreviousInputAtStep(history, 0, userId)) updateSkills((metaData.skill ?? metaData.setup)!, false, userId)
// 				return
// 			default:
// 				throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
// 		}
// 	})

// 	// Determine the new progress.
// 	if (someCorrect) return { solved: true, done: true }
// 	if (allGaveUp) return nextStep({ split: true, step: 0 }, metaData.steps.length)
// 	return progress
// }

// // Reduce a set of actions for a step.
// function reduceStepActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState>): StepExerciseProgress {
// 	const { metaData } = exercise
// 	const { progress } = input
// 	const step = getStep(progress)
// 	const skill = metaData.steps[step - 1]
// 	if (Array.isArray(skill)) return reduceStepWithSubstepsActions(exercise, input)
// 	return reduceStepWithoutSubstepsActions(exercise, input)
// }

// function reduceStepWithoutSubstepsActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState>): StepExerciseProgress {
// 	const { metaData, checkInput, getSolution } = exercise
// 	const { progress, submissions, state, history, updateSkills } = input
// 	const step = getStep(progress)
// 	const skill = metaData.steps[step - 1] as SkillSetupLike

// 	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
// 	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

// 	// Check all input actions.
// 	const correct = submissions.map(submission => {
// 		if (submission.action.type !== 'input') return false
// 		const exerciseInput = toFO(submission.action.input, true) as InputExerciseInput
// 		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
// 		return checkInput({ state, input: exerciseInput, solution, metaData }, step, 0)
// 	})

// 	// If any submission is correct, or if all gave up, the step is done.
// 	const someCorrect = correct.some(isCorrect => isCorrect)
// 	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
// 	const isDone = someCorrect || allGaveUp
// 	submissions.forEach((submission, index) => {
// 		const { action, userId } = submission
// 		switch (action.type) {
// 			case 'input':
// 				if (skill) updateSkills(skill, correct[index], userId)
// 				return
// 			case 'giveUp':
// 				if (skill && isDone && !hasPreviousInputAtStep(history, step, userId)) updateSkills(skill, false, userId)
// 				return
// 			default:
// 				throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
// 		}
// 	})

// 	// Determine the new progress.
// 	if (someCorrect) return nextStep({ ...progress, [step]: { solved: true, done: true } }, metaData.steps.length)
// 	if (allGaveUp) return nextStep({ ...progress, [step]: { ...getStepProgress(progress, step), givenUp: true, done: true } }, metaData.steps.length)
// 	return progress
// }

// function reduceStepWithSubstepsActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: StepExercise<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, StepExerciseProgress, TState>): StepExerciseProgress {
// 	const { metaData, checkInput, getSolution } = exercise
// 	const { progress, submissions, state, history, updateSkills } = input
// 	const step = getStep(progress)
// 	const skill = metaData.steps[step - 1]
// 	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubstepsActions call: expected step ${step} to have substeps.`)

// 	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
// 	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

// 	// Walk through the substeps and check them one by one.
// 	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
// 	const stepProgress = { ...getStepProgress(progress, step) }
// 	skill.forEach((subskill, index) => {
// 		// Ignore already completed substeps.
// 		const substep = index + 1
// 		if (stepProgress[`${substep}`]) return

// 		// Check all input actions.
// 		const correct = submissions.map(submission => {
// 			if (submission.action.type !== 'input') return false
// 			const exerciseInput = toFO(submission.action.input, true) as InputExerciseInput
// 			const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
// 			return checkInput({ state, input: exerciseInput, solution, metaData }, step, substep)
// 		})
// 		const someCorrect = correct.some(isCorrect => isCorrect)
// 		const isDone = someCorrect || allGaveUp

// 		// Run the skill updates for the skill of this step.
// 		submissions.forEach((submission, index) => {
// 			const { action, userId } = submission
// 			switch (action.type) {
// 				case 'input':
// 					if (subskill) updateSkills(subskill, correct[index], userId)
// 					return
// 				case 'giveUp':
// 					if (subskill && isDone && !hasPreviousInputAtStep(history, step, userId)) updateSkills(subskill, false, userId)
// 					return
// 				default:
// 					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
// 			}
// 		})

// 		// Remember correct substeps.
// 		if (someCorrect) stepProgress[`${substep}`] = true
// 	})

// 	// Determine the new progress, given the substep progress.
// 	const everySubstepSolved = skill.every((_, index) => stepProgress[`${index + 1}`])
// 	if (everySubstepSolved) return nextStep({ ...progress, [step]: { ...stepProgress, solved: true, done: true } }, metaData.steps.length)
// 	if (allGaveUp) return nextStep({ ...progress, [step]: { ...stepProgress, givenUp: true, done: true } }, metaData.steps.length)
// 	return { ...progress, [step]: stepProgress }
// }

// // Move progress to the next step, or mark the full exercise done.
// function nextStep(progress: StepExerciseProgress, numSteps: number): StepExerciseProgress {
// 	const step = getStep(progress)
// 	if (step === numSteps) return { ...progress, done: true } as StepExerciseProgress
// 	const nextStep = step + 1
// 	return { ...progress, split: true, step: nextStep, [nextStep]: {} }
// }

// // Get a step within the progress and ensure it's typed correctly.
// function getStepProgress(progress: StepExerciseProgress, step: number): StepExerciseStepProgress {
// 	if (!('split' in progress)) throw new Error(`Invalid getStepProgress call: cannot get the progress of a StepExercise that has not been split up yet.`)
// 	return (progress as StepExerciseSplitProgress)[`${step}`] ?? {}
// }
