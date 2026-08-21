import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, generateExerciseParameters } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseReducerSubmissionsInput, type Solution, assembleSolution, deserializeInputExerciseParameters, hasPreviousInput, serializeInputExerciseParameters } from '../InputExercise'

import type { SimpleExerciseState, SimpleExercise, SimpleExerciseSpec } from './types'

// Build a SimpleExercise from its author-facing spec.
export function buildSimpleExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>): SimpleExercise<TParameters, TSolution> {
	return {
		...spec,
		type: 'simple',
		generateParameters: example => serializeInputExerciseParameters(generateExerciseParameters(spec.generateParameters, example)),
		processSoloAction: buildSimpleExerciseSoloReducer(spec),
		processGroupActions: buildSimpleExerciseGroupReducer(spec),
	}
}

export function buildSimpleExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>): SoloExerciseReducer<InputExerciseAction, SimpleExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceGroupActions(spec, { ...runtimeInput, mode: 'solo', submissions: [{ action: input.action }] })
	}
}

export function buildSimpleExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>): GroupExerciseReducer<InputExerciseAction, SimpleExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceGroupActions(spec, runtimeInput)
	}
}

// Reduce a set of actions for a group of users.
function reduceGroupActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerSubmissionsInput<InputExerciseAction, SimpleExerciseState, TParameters>): SimpleExerciseState {
	const { metaData, checkInput, getSolution } = spec
	const { mode, submissions, parameters, history, updateSkills } = input

	const staticSolution = submissions.some(submission => submission.action.type === 'input') && typeof getSolution === 'function' ? getSolution(parameters) : undefined

	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(submission.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: submission.action.input, input: exerciseInput, solution })
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
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true } as SimpleExerciseState
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
