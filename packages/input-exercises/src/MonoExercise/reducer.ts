import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'
import { interpretInputData } from '@step-wise/input-interpretation'
import { type ValueTypeAdapters, combineValueTypes, extractValueTypeAdapters, fundamentalValueTypes } from '@step-wise/value-types'

import { type InputExerciseAction, type InputExerciseParameters, type InputExerciseSolution, resolveSolution } from '../InputExercise/index.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization.ts'
import { type InputExerciseReducerActionsInput, addAttemptsToState, hasAttempted } from '../reducerSupport.ts'

import type { MonoExerciseState, MonoExercise, MonoExerciseSpec } from './types.ts'

// Build a MonoExercise from its author-facing spec.
export function buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>): MonoExercise<TParameters, TSolution> {
	const valueTypes = combineValueTypes(fundamentalValueTypes, spec.valueTypes ?? {})
	const valueTypeAdapters = extractValueTypeAdapters(valueTypes)
	return {
		...spec,
		valueTypes,
		type: 'mono',
		generateParameters: example => serializeInputExerciseParameters(resolveExerciseParameters(spec.generateParameters, example), valueTypeAdapters.serializationAdapters),
		getInitialState: () => ({}),
		processSoloAction: buildMonoExerciseSoloReducer(spec, valueTypeAdapters),
		processGroupActions: buildMonoExerciseGroupReducer(spec, valueTypeAdapters),
	}
}

function buildMonoExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>, valueTypeAdapters: ValueTypeAdapters): SoloExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueTypeAdapters.serializationAdapters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] }, valueTypeAdapters)
	}
}

function buildMonoExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>, valueTypeAdapters: ValueTypeAdapters): GroupExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueTypeAdapters.serializationAdapters), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, runtimeInput, valueTypeAdapters)
	}
}

// Reduce a normalized set of solo or group actions.
function reduceActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: MonoExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, MonoExerciseState, TParameters>, valueTypeAdapters: ValueTypeAdapters): MonoExerciseState {
	const { metadata, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const newState = addAttemptsToState(state, mode, actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId))

	const staticSolution = actions.some(userAction => userAction.action.type === 'input') && typeof getSolution === 'function' ? getSolution(parameters) : undefined

	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = interpretInputData(userAction.action.input, valueTypeAdapters.inputValueAdapters)
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution, equalityAdapters: valueTypeAdapters.equalityAdapters })
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
		if (someCorrect) return { ...newState, solved: true, done: true }
		return { ...newState, givenUp: true, done: true }
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
