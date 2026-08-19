import { interpretAllInputValues } from '@step-wise/input-interpretation'
import type { ExerciseReducer, ExerciseReducerInput, GroupExerciseSubmission } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseState, type InputExerciseReducerSoloInput, type InputExerciseReducerSubmissionsInput, type InputExerciseReducerInput, type Solution, assembleSolution, deserializeInputExerciseState, hasPreviousInput, serializeInputExerciseState } from '../InputExercise'

import type { SimpleExerciseProgress, SimpleExercise, SimpleExerciseSpec } from './types'

// Build a SimpleExercise from its author-facing spec.
export function buildSimpleExercise<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): SimpleExercise<TState, TSolution> {
	return {
		...spec,
		type: 'simple',
		generateState: example => serializeInputExerciseState(spec.generateState(example)),
		processAction: buildSimpleExerciseReducer(spec),
	}
}

// Set up the reducer for a SimpleExercise.
export function buildSimpleExerciseReducer<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): ExerciseReducer<InputExerciseAction, SimpleExerciseProgress> {
	return (input: ExerciseReducerInput<InputExerciseAction, SimpleExerciseProgress>) => {
		const runtimeInput = { ...input, state: deserializeInputExerciseState<TState>(input.state) } as InputExerciseReducerInput<InputExerciseAction, SimpleExerciseProgress, TState>
		if ('done' in runtimeInput.progress && runtimeInput.progress.done) return runtimeInput.progress
		if (runtimeInput.history.mode === 'group') return reduceGroupActions(spec, runtimeInput as InputExerciseReducerSubmissionsInput<InputExerciseAction, SimpleExerciseProgress, TState>)
		return reduceUserAction(spec, runtimeInput as InputExerciseReducerSoloInput<InputExerciseAction, SimpleExerciseProgress, TState>)
	}
}

// Reduce an action for a single user.
function reduceUserAction<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>, input: InputExerciseReducerSoloInput<InputExerciseAction, SimpleExerciseProgress, TState>): SimpleExerciseProgress {
	return reduceGroupActions(spec, {
		...input,
		submissions: [{ action: input.action }],
	})
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, SimpleExerciseProgress, TState>): SimpleExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { submissions, state, history, updateSkills } = input

	const staticSolution = submissions.some(submission => submission.action.type === 'input') && typeof getSolution === 'function' ? getSolution(state) : undefined

	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, state, exerciseInput) : undefined)
		return checkInput({ metaData, state, rawInput: submission.action.input, input: exerciseInput, solution })
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
