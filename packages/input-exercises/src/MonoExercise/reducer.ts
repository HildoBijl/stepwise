import type { PlainDataObject } from '@step-wise/js-utils'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type GroupInputExerciseReport, type InputDependency, type InputExerciseAction, type InputExerciseParameters, type InputExerciseSolution, type InputExerciseValueOperations, type SoloInputExerciseReport, resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from '../InputExercise/index.ts'
import { getGroupInputExerciseReport, normalizeCheckInputResult } from '../InputExercise/checkInput.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization.ts'
import { createInputExerciseValueOperations } from '../InputExercise/valueOperations.ts'
import { type InputExerciseActionsReduction, type InputExerciseReducerInput, addAttemptsToState, getInputDependency, hasAttempted, setInputDependencies } from '../InputExercise/reducerSupport.ts'

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

// Build the solo reducer for a MonoExercise, which processes actions for a single user.
function buildMonoExerciseSoloReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): SoloExerciseReducer<InputExerciseAction, MonoExerciseState, PlainDataObject, SoloInputExerciseReport> {
	return async reducerInput => {
		const runtimeInput = { ...reducerInput, parameters: deserializeInputExerciseParameters<TParameters>(reducerInput.parameters, valueOperations.deserialize) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: reducerInput.action }] }, valueOperations)
		return reports[0] === undefined ? { state } : { state, report: reports[0] }
	}
}

// Build the group reducer for a MonoExercise, which processes actions from multiple users.
function buildMonoExerciseGroupReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): GroupExerciseReducer<InputExerciseAction, MonoExerciseState, PlainDataObject, GroupInputExerciseReport> {
	return async reducerInput => {
		if (reducerInput.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...reducerInput, parameters: deserializeInputExerciseParameters<TParameters>(reducerInput.parameters, valueOperations.deserialize), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, runtimeInput, valueOperations)
		const report = getGroupInputExerciseReport(reducerInput.actions.map(({ userId }) => userId), reports)
		return report === undefined ? { state } : { state, report }
	}
}

// Reduce a normalized set of solo or group actions.
async function reduceActions<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: MonoExerciseSpec<TParameters, TSolution, TInputDependency>, reducerInput: InputExerciseReducerInput<InputExerciseAction, MonoExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<InputExerciseActionsReduction<MonoExerciseState>> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = reducerInput
	let newState = addAttemptsToState(state, mode, actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId))

	// Run the checkInput function for all input actions, and also update the inputDependencies.
	const staticSolution = actions.some(userAction => userAction.action.type === 'input') ? await resolveStaticSolution(spec, parameters) : {}
	const results = await Promise.all(actions.map(async userAction => {
		if (userAction.action.type !== 'input') return { correct: false }
		const input = valueOperations.interpretInput(userAction.action.input)
		const previousInputDependency = getInputDependency<TInputDependency>(state, mode, valueOperations, mode === 'group' ? userAction.action.adoptUserHistory ?? userAction.userId : userAction.userId)
		const inputDependency = await resolveUpdatedInputDependency(spec, { parameters, previousInputDependency, staticSolution, input: input, step: 0 })
		const solution = await resolveSolution(spec, parameters, inputDependency, staticSolution)
		const result = normalizeCheckInputResult(await checkInput({ metadata, parameters, rawInput: userAction.action.input, input, inputDependency, solution, areValuesEqual: valueOperations.areValuesEqual }))
		return { ...result, inputDependency }
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

	// Update the state and return it together with the reports.
	const reports = results.map(result => 'report' in result ? result.report : undefined)
	if (someCorrect) return { state: { ...newState, solved: true, done: true }, reports }
	else if (allGaveUp) return { state: { ...newState, givenUp: true, done: true }, reports }
	else return { state: newState, reports }
}
