import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters, resolveInitialState } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseReducerActionsInput, type Solution, assembleSolution, deserializeInputExerciseParameters, hasPreviousInput, serializeInputExerciseParameters } from '../InputExercise'

import type { SimpleExerciseState, SimpleExercise, SimpleExerciseSpec } from './types'

// Build a SimpleExercise from its author-facing spec.
export function buildSimpleExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>): SimpleExercise<TParameters, TSolution> {
	return {
		...spec,
		type: 'simple',
		generateParameters: example => serializeInputExerciseParameters(resolveExerciseParameters(spec.generateParameters, example)),
		getInitialState: parameters => resolveInitialState<TParameters, SimpleExerciseState>(spec.getInitialState, deserializeInputExerciseParameters<TParameters>(parameters)),
		processSoloAction: buildSimpleExerciseSoloReducer(spec),
		processGroupActions: buildSimpleExerciseGroupReducer(spec),
	}
}

export function buildSimpleExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>): SoloExerciseReducer<InputExerciseAction, SimpleExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceGroupActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] })
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
function reduceGroupActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends Solution = Solution>(spec: SimpleExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, SimpleExerciseState, TParameters>): SimpleExerciseState {
	const { metaData, checkInput, getSolution } = spec
	const { mode, actions, parameters, history, updateSkills } = input

	const staticSolution = actions.some(userAction => userAction.action.type === 'input') && typeof getSolution === 'function' ? getSolution(parameters) : undefined

	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = interpretAllInputValues(userAction.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? assembleSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metaData, parameters, rawInput: userAction.action.input, input: exerciseInput, solution })
	})

	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		if (updateSkills !== undefined) {
			actions.forEach((userAction, index) => {
				const { action, userId } = userAction
				if (action.type === 'input' || !hasPreviousInput(mode, history, userId)) {
					if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
					if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
				}
			})
		}
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true } as SimpleExerciseState
	}

	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			if (action.type === 'input') {
				if (metaData.skill) updateSkills(metaData.skill, correct[index], userId)
				if (metaData.setup) updateSkills(metaData.setup, correct[index], userId)
			}
		})
	}

	return {}
}
