import { interpretAllInputValues } from '@step-wise/input-interpretation'
import type { ExerciseReducer, ExerciseReducerSingleUserInput, ExerciseReducerGroupInput, ExerciseReducerInput, ExerciseState, GroupExerciseSubmission } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type Solution, assembleSolution, hasPreviousInput } from '../InputExercise'

import type { SimpleExerciseProgress, SimpleExercise, SimpleExerciseSpec } from './types'

// Build a SimpleExercise from its author-facing spec.
export function buildSimpleExercise<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): SimpleExercise<TState, TSolution> {
	return {
		...spec,
		type: 'simple',
		processAction: buildSimpleExerciseReducer(spec),
	}
}

// Set up the reducer for a SimpleExercise.
export function buildSimpleExerciseReducer<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): ExerciseReducer<InputExerciseAction, SimpleExerciseProgress, TState> {
	return (input: ExerciseReducerInput<InputExerciseAction, SimpleExerciseProgress, TState>) => {
		if ('done' in input.progress && input.progress.done) return input.progress
		return ('submissions' in input) ? reduceGroupActions(spec, input) : reduceUserAction(spec, input)
	}
}

// Reduce an action for a single user.
function reduceUserAction<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>, input: ExerciseReducerSingleUserInput<InputExerciseAction, SimpleExerciseProgress, TState> & { action: InputExerciseAction, submissions?: never }): SimpleExerciseProgress {
	return reduceGroupActions(spec, {
		...input,
		submissions: [{ action: input.action }],
		action: undefined,
	} as ExerciseReducerGroupInput<InputExerciseAction, SimpleExerciseProgress, TState>)
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TState extends ExerciseState = ExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>, input: ExerciseReducerGroupInput<InputExerciseAction, SimpleExerciseProgress, TState> & { submissions: GroupExerciseSubmission<InputExerciseAction>[], action?: never }): SimpleExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { submissions, state, history, updateSkills } = input

	const staticSolution = submissions.some(submission => submission.action.type === 'input') && typeof getSolution === 'function' ? getSolution(state) : undefined

	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
		return checkInput({ metaData, state, input: exerciseInput, solution })
	})

	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		if (updateSkills !== undefined) {
			submissions.forEach((submission, index) => {
				const { action, userId } = submission
				if (action.type === 'input' || !hasPreviousInput(history, userId)) {
					if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
					if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
				}
			})
		}
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true } as SimpleExerciseProgress
	}

	if (updateSkills !== undefined) {
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			if (action.type === 'input') {
				if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
				if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
			}
		})
	}

	return {}
}
