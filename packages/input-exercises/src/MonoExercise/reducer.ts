import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type InputDependency, type InputExerciseAction, type InputExerciseParameters, type InputExerciseSolution, type InputExerciseValueOperations, resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from '../InputExercise/index.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization.ts'
import { createInputExerciseValueOperations } from '../InputExercise/valueOperations.ts'
import { type InputExerciseReducerInput, addAttemptsToState, getInputDependency, hasAttempted, setInputDependencies } from '../InputExercise/reducerSupport.ts'

import type { MonoExerciseState, MonoExercise, MonoExerciseSpec } from './types.ts'

// Build a MonoExercise from its author-facing spec.
export function buildMonoExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>): MonoExercise<TParameters, TSolution, TInputDependency> {
	const { valueTypes, ...definition } = spec
	const valueOperations = createInputExerciseValueOperations(valueTypes)
	return {
		...definition,
		valueOperations,
		type: 'mono',
		generateParameters: async example => serializeInputExerciseParameters(await resolveExerciseParameters(spec.generateParameters, example), valueOperations.serialize),
		getInitialState: () => ({}),
		processSoloAction: buildMonoExerciseSoloReducer(spec, valueOperations),
		processGroupActions: buildMonoExerciseGroupReducer(spec, valueOperations),
	}
}

function buildMonoExerciseSoloReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): SoloExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return async reducerInput => {
		const runtimeInput = { ...reducerInput, parameters: deserializeInputExerciseParameters<TParameters>(reducerInput.parameters, valueOperations.deserialize) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		return { state: await reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: reducerInput.action }] }, valueOperations) }
	}
}

function buildMonoExerciseGroupReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): GroupExerciseReducer<InputExerciseAction, MonoExerciseState> {
	return async reducerInput => {
		if (reducerInput.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...reducerInput, parameters: deserializeInputExerciseParameters<TParameters>(reducerInput.parameters, valueOperations.deserialize), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		return { state: await reduceActions(spec, runtimeInput, valueOperations) }
	}
}

// Reduce a normalized set of solo or group actions.
async function reduceActions<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, reducerInput: InputExerciseReducerInput<InputExerciseAction, MonoExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<MonoExerciseState> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = reducerInput
	let newState = addAttemptsToState(state, mode, actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId))

	// Check each action for correctness and update the input dependency if applicable.
	const staticSolution = actions.some(userAction => userAction.action.type === 'input') ? await resolveStaticSolution(spec, parameters) : {}
	const results = await Promise.all(actions.map(async userAction => {
		if (userAction.action.type !== 'input') return { correct: false }
		const exerciseInput = valueOperations.interpretInput(userAction.action.input)
		const previousInputDependency = getInputDependency<TInputDependency>(state, mode, valueOperations, mode === 'group' ? userAction.action.adoptUserHistory ?? userAction.userId : userAction.userId)
		const inputDependency = await resolveUpdatedInputDependency(spec, { parameters, previousInputDependency, staticSolution, input: exerciseInput, step: 0 })
		const solution = await resolveSolution(spec, parameters, inputDependency, staticSolution)
		const correct = await checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution, areValuesEqual: valueOperations.areValuesEqual })
		return { correct, inputDependency }
	}))
	if (spec.updateInputDependency !== undefined) newState = setInputDependencies(newState, mode, results.flatMap((result, index) => 'inputDependency' in result ? [{ userId: actions[index].userId, value: result.inputDependency }] : []), valueOperations)

	// Determine if the exercise is solved or given up, and update skills if applicable.
	const correct = results.map(result => result.correct)
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			if (action.type === 'input' || (isDone && !hasAttempted(state, mode, userId))) {
				if (metadata.skill) updateSkills(metadata.skill, correct[index], userId)
				if (metadata.setup) updateSkills(metadata.setup, correct[index], userId)
			}
		})
	}

	// Return the updated state, marking it as solved or given up if applicable.
	if (someCorrect) return { ...newState, solved: true, done: true }
	else if (allGaveUp) return { ...newState, givenUp: true, done: true }
	else return newState
}
