import { interpretInputData } from '@step-wise/input-interpretation'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseSolution, resolveSolution } from '../InputExercise'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization'
import { type InputExerciseReducerActionsInput, addAttemptsToState, hasAttempted } from '../reducerSupport'

import type { MonoExerciseState, MonoExercise, MonoExerciseSpec } from './types'

// Build a MonoExercise from its author-facing spec.
export function buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): MonoExercise<TParameters, TSolution> {
	return {
		...spec,
		type: 'mono',
		generateParameters: example => serializeInputExerciseParameters(resolveExerciseParameters(spec.generateParameters, example)),
		getInitialState: () => ({}),
		processSoloAction: buildMonoExerciseSoloReducer(spec),
		processGroupActions: buildMonoExerciseGroupReducer(spec),
	}
}

function buildMonoExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): SoloExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] })
	}
}

function buildMonoExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): GroupExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, runtimeInput)
	}
}

// Reduce a normalized set of solo or group actions.
function reduceActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, MonoExerciseState, TParameters>): MonoExerciseState {
	const { metadata, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const newState = addAttemptsToState(state, mode, actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId))

	const staticSolution = actions.some(userAction => userAction.action.type === 'input') && typeof getSolution === 'function' ? getSolution(parameters) : undefined

	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = interpretInputData(userAction.action.input) as InputExerciseInput
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution })
	})

	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		if (updateSkills !== undefined) {
			actions.forEach((userAction, index) => {
				const { action, userId } = userAction
				if (action.type === 'input' || !hasAttempted(state, mode, userId)) {
					if (metadata.skill) updateSkills(metadata.skill, correct[index], userId)
					if (metadata.setup) updateSkills(metadata.setup, correct[index], userId)
				}
			})
		}
		return { ...newState, [someCorrect ? 'solved' : 'givenUp']: true, done: true } as MonoExerciseState
	}

	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			if (action.type === 'input') {
				if (metadata.skill) updateSkills(metadata.skill, correct[index], userId)
				if (metadata.setup) updateSkills(metadata.setup, correct[index], userId)
			}
		})
	}

	return newState
}
