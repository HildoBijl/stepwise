import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, generateExerciseState } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseState, type InputExerciseReducerSubmissionsInput, type Solution, assembleSolution, deserializeInputExerciseState, hasPreviousInput, serializeInputExerciseState } from '../InputExercise'

import type { SimpleExerciseProgress, SimpleExercise, SimpleExerciseSpec } from './types'

// Build a SimpleExercise from its author-facing spec.
export function buildSimpleExercise<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): SimpleExercise<TState, TSolution> {
	return {
		...spec,
		type: 'simple',
		generateState: example => serializeInputExerciseState(generateExerciseState(spec.generateState, example)),
		processSoloAction: buildSimpleExerciseSoloReducer(spec),
		processGroupActions: buildSimpleExerciseGroupReducer(spec),
	}
}

export function buildSimpleExerciseSoloReducer<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): SoloExerciseReducer<InputExerciseAction, SimpleExerciseProgress> {
	return input => {
		const runtimeInput = { ...input, state: deserializeInputExerciseState<TState>(input.state) }
		if ('done' in runtimeInput.progress && runtimeInput.progress.done) return runtimeInput.progress
		return reduceGroupActions(spec, { ...runtimeInput, mode: 'solo', submissions: [{ action: input.action }] })
	}
}

export function buildSimpleExerciseGroupReducer<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>): GroupExerciseReducer<InputExerciseAction, SimpleExerciseProgress> {
	return input => {
		const runtimeInput = { ...input, state: deserializeInputExerciseState<TState>(input.state), mode: 'group' as const }
		if ('done' in runtimeInput.progress && runtimeInput.progress.done) return runtimeInput.progress
		return reduceGroupActions(spec, runtimeInput)
	}
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TState extends InputExerciseState = InputExerciseState, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TState, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, SimpleExerciseProgress, TState>): SimpleExerciseProgress {
	const { metaData, checkInput, getSolution } = spec
	const { mode, submissions, state, history, updateSkills } = input

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
				if (action.type === 'input' || !hasPreviousInput(mode, history, userId)) {
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
