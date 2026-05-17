// import { toFO } from '../../../../inputTypes'

// import type { ExerciseReducer, ExerciseReducerUserInput, ExerciseReducerGroupInput, ExerciseReducerInput, ExerciseState, GroupExerciseSubmission } from '../Exercise'
// import { type InputExerciseAction, type InputExerciseInput, type InputExercise, type Solution, assembleSolution, hasPreviousInput } from '../InputExercise'

// import type { SimpleExerciseProgress } from './types'

// // Set up the reducer for a SimpleExercise.
// export function getSimpleExerciseReducer<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: InputExercise<any, InputExerciseAction, SimpleExerciseProgress, TState, TSolution>): ExerciseReducer<InputExerciseAction, SimpleExerciseProgress, TState> {
// 	return (input: ExerciseReducerInput<InputExerciseAction, SimpleExerciseProgress, TState>) => {
// 		if ('done' in input.progress && input.progress.done) return input.progress
// 		if ('submissions' in input) return reduceGroupActions(exercise, input)
// 		return reduceUserAction(exercise, input)
// 	}
// }

// // Reduce an action for a single user.
// function reduceUserAction<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: InputExercise<any, InputExerciseAction, SimpleExerciseProgress, TState, TSolution>, input: ExerciseReducerUserInput<InputExerciseAction, SimpleExerciseProgress, TState> & { action: InputExerciseAction, submissions?: never }): SimpleExerciseProgress {
// 	return reduceGroupActions(exercise, {
// 		...input,
// 		submissions: [{ action: input.action }],
// 		action: undefined,
// 	} as ExerciseReducerGroupInput<InputExerciseAction, SimpleExerciseProgress, TState>)
// }

// // Reduce a set of actions for a group of users.
// function reduceGroupActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(exercise: InputExercise<any, InputExerciseAction, SimpleExerciseProgress, TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, SimpleExerciseProgress, TState> & { submissions: GroupExerciseSubmission<InputExerciseAction>[], action?: never }): SimpleExerciseProgress {
// 	const { metaData, checkInput, getSolution } = exercise
// 	const { submissions, state, history, updateSkills } = input

// 		// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
// 	const staticSolution = typeof getSolution === 'function' && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

// 	// Check all input actions.
// 	const correct = submissions.map(submission => {
// 		if (submission.action.type !== 'input') return false
// 		const exerciseInput = toFO(submission.action.input, true) as InputExerciseInput
// 		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
// 		return checkInput({ state, input: exerciseInput, solution, metaData })
// 	})

// 	// If any submission is correct, or if all gave up, the exercise is done.
// 	const someCorrect = correct.some(isCorrect => isCorrect)
// 	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
// 	if (someCorrect || allGaveUp) {
// 		submissions.forEach((submission, index) => {
// 			const { action, userId } = submission
// 			if (action.type === 'input' || !hasPreviousInput(history, userId)) {
// 				if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
// 				if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
// 			}
// 		})
// 		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true } as SimpleExerciseProgress
// 	}

// 	// No one had it right. Give skill updates to wrong input submissions and leave the exercise open.
// 	submissions.forEach((submission, index) => {
// 		const { action, userId } = submission
// 		if (action.type === 'input') {
// 			if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
// 			if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
// 		}
// 	})
// 	return {}
// }
