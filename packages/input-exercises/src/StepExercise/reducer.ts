import type { PlainDataObject } from '@step-wise/js-utils'
import type { SkillSetupLike } from '@step-wise/skill-setup'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type GroupInputExerciseReport, type InputDependency, type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseRawInput, type InputExerciseReport, type InputExerciseSolution, type InputExerciseValueOperations, type SoloInputExerciseReport, resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from '../InputExercise/index.ts'
import { getGroupInputExerciseReport, mergeInputExerciseReports, normalizeCheckInputResult } from '../InputExercise/checkInput.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization.ts'
import { createInputExerciseValueOperations } from '../InputExercise/valueOperations.ts'
import { type InputExerciseActionsReduction, type InputExerciseReducerInput, addAttemptsToState, getInputDependency, hasAttempted, setInputDependencies } from '../InputExercise/reducerSupport.ts'

import type { StepExerciseState, StepExerciseStepState, StepExerciseSplitState, StepExercise, StepExerciseSpec } from './types.ts'
import { ensureStepExerciseSteps } from './preprocessing.ts'
import { getCurrentStep } from './history.ts'

// Build a StepExercise from its author-facing spec.
export function buildStepExercise<
	TParameters extends InputExerciseParameters = InputExerciseParameters,
	TSolution extends InputExerciseSolution = InputExerciseSolution,
	TInputDependency = InputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>
): StepExercise<TParameters, TSolution, TInputDependency> {
	ensureStepExerciseSteps(spec.metadata.steps)
	const { valueTypes, ...definition } = spec
	const valueOperations = createInputExerciseValueOperations(valueTypes)
	return {
		...definition,
		valueOperations,
		type: 'step',
		generateParameters: async example => serializeInputExerciseParameters(await resolveExerciseParameters(spec.generateParameters, example), valueOperations.serialize),
		getInitialState: () => ({}),
		processSoloAction: buildStepExerciseSoloReducer(spec, valueOperations),
		processGroupActions: buildStepExerciseGroupReducer(spec, valueOperations),
	}
}

// Build a reducer for a StepExercise in solo mode.
function buildStepExerciseSoloReducer<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	valueOperations: InputExerciseValueOperations
): SoloExerciseReducer<InputExerciseAction, StepExerciseState, PlainDataObject, SoloInputExerciseReport> {
	return async input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueOperations.deserialize) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] }, valueOperations)
		return reports[0] === undefined ? { state } : { state, report: reports[0] }
	}
}

// Build a reducer for a StepExercise in group mode.
function buildStepExerciseGroupReducer<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	valueOperations: InputExerciseValueOperations
): GroupExerciseReducer<InputExerciseAction, StepExerciseState, PlainDataObject, GroupInputExerciseReport> {
	return async input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueOperations.deserialize), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, runtimeInput, valueOperations)
		const report = getGroupInputExerciseReport(input.actions.map(({ userId }) => userId), reports)
		return report === undefined ? { state } : { state, report }
	}
}

// Reduce the actions for a StepExercise, returning the updated state and reports.
async function reduceActions<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations
): Promise<InputExerciseActionsReduction<StepExerciseState>> {
	return ('split' in input.state && input.state.split)
		? await reduceCurrentStep(spec, input, valueOperations)
		: await reduceMainProblem(spec, input, valueOperations)
}

// Reduce the actions for the main problem of a StepExercise, returning the updated state and reports.
async function reduceMainProblem<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations
): Promise<InputExerciseActionsReduction<StepExerciseState>> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	let newState = addAttemptsToState(state, mode, getAttemptingUserIds(actions))

	// Run the checkInput function for all input actions, and also update the inputDependencies.
	const inputActionsData = await resolveInputActionsData(spec, input, valueOperations, 0)
	newState = addDependenciesToState(newState, mode, actions, inputActionsData, valueOperations, spec.updateInputDependency !== undefined)
	const checkResults = await Promise.all(inputActionsData.map(async inputActionData => inputActionData === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, ...inputActionData, areValuesEqual: valueOperations.areValuesEqual }, 0, 0))))

	// Determine if the exercise is solved or given up, and update skills if applicable.
	const correct = checkResults.map(result => result.correct)
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
	const reports = checkResults.map(result => result.report)
	if (someCorrect) return { state: { ...newState, solved: true, done: true }, reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...newState, split: true, step: 0 }, metadata.steps.length), reports }
	return { state: newState, reports }
}

// Reduce the actions for the current step of a StepExercise, returning the updated state and reports.
async function reduceCurrentStep<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations
): Promise<InputExerciseActionsReduction<StepExerciseState>> {
	const step = getCurrentStep(input.state)
	const skill = spec.metadata.steps[step - 1]
	return Array.isArray(skill)
		? await reduceStepWithSubsteps(spec, input, valueOperations)
		: await reduceStepWithoutSubsteps(spec, input, valueOperations, skill)
}

// Reduce the actions for a step of a StepExercise that has no substeps, returning the updated state and reports.
async function reduceStepWithoutSubsteps<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations,
	skill: SkillSetupLike | undefined
): Promise<InputExerciseActionsReduction<StepExerciseState>> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const stepState = getStepState(state, step)
	const newStepState = addAttemptsToState(stepState, mode, getAttemptingUserIds(actions))

	// Run the checkInput function for all input actions, and also update the inputDependencies.
	const inputActionsData = await resolveInputActionsData(spec, input, valueOperations, step)
	const stateWithDependencies = addDependenciesToState(state, mode, actions, inputActionsData, valueOperations, spec.updateInputDependency !== undefined)
	const checkResults = await Promise.all(inputActionsData.map(async inputActionData => inputActionData === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, ...inputActionData, areValuesEqual: valueOperations.areValuesEqual }, step, 0))))

	// Determine if the exercise is solved or given up, and update skills if applicable.
	const correct = checkResults.map(result => result.correct)
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			if (action.type === 'input' || (isDone && !hasAttempted(stepState, mode, userId))) {
				if (skill) updateSkills(skill, correct[index], userId)
			}
		})
	}

	// Update the state and return it together with the reports.
	const reports = checkResults.map(result => result.report)
	if (someCorrect) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...newStepState, solved: true, done: true } }, metadata.steps.length), reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...newStepState, givenUp: true, done: true } }, metadata.steps.length), reports }
	return { state: { ...stateWithDependencies, [step]: newStepState }, reports }
}

// Reduce the actions for a step of a StepExercise that has substeps, returning the updated state and reports.
async function reduceStepWithSubsteps<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations
): Promise<InputExerciseActionsReduction<StepExerciseState>> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const previousStepState = getStepState(state, step)
	const stepState = addAttemptsToState({ ...previousStepState }, mode, getAttemptingUserIds(actions))
	const skill = metadata.steps[step - 1]
	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubsteps call: expected step ${step} to have substeps.`)

	// Run the checkInput function for all input actions, and also update the inputDependencies.
	const inputActionsData = await resolveInputActionsData(spec, input, valueOperations, step)
	const stateWithDependencies = addDependenciesToState(state, mode, actions, inputActionsData, valueOperations, spec.updateInputDependency !== undefined)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const reports: (InputExerciseReport | undefined)[] = actions.map(() => undefined)
	for (const [index, subskill] of skill.entries()) {
		// Skip substeps that have already been solved or given up.
		const substep = index + 1
		if (stepState[`${substep}`]) continue

		// Run the checkInput function for all input actions for this substep, and also update the reports.
		const checkResults = await Promise.all(inputActionsData.map(async inputActionData => inputActionData === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, ...inputActionData, areValuesEqual: valueOperations.areValuesEqual }, step, substep))))
		checkResults.forEach((result, resultIndex) => reports[resultIndex] = mergeInputExerciseReports(reports[resultIndex], result.report))

		// Determine if the exercise is solved or given up, and update skills if applicable.
		const correct = checkResults.map(result => result.correct)
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp
		if (updateSkills !== undefined) {
			actions.forEach((userAction, index) => {
				const { action, userId } = userAction
				if (action.type === 'input' || (isDone && !hasAttempted(previousStepState, mode, userId))) {
					if (subskill) updateSkills(subskill, correct[index], userId)
				}
			})
		}

		// If any user submitted a correct input for this substep, mark it as solved in the state.
		if (someCorrect) stepState[`${substep}`] = true
	}

	// Determine if the exercise is solved or given up, and update skills if applicable.
	const everySubstepSolved = skill.every((_, index) => stepState[`${index + 1}`])
	if (everySubstepSolved) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...stepState, solved: true, done: true } }, metadata.steps.length), reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...stepState, givenUp: true, done: true } }, metadata.steps.length), reports }
	return { state: { ...stateWithDependencies, [step]: stepState }, reports }
}

// Data structure for each input action, including its input dependency and solution.
type InputActionData<TInputDependency, TSolution extends InputExerciseSolution> = {
	rawInput: InputExerciseRawInput
	input: InputExerciseInput
	inputDependency: TInputDependency | undefined
	solution: TSolution | undefined
}

// Resolve the data needed to process each input action, including its input dependency and solution.
async function resolveInputActionsData<
	TParameters extends InputExerciseParameters,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>,
	reducerInput: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>,
	valueOperations: InputExerciseValueOperations, step: number
): Promise<(InputActionData<TInputDependency, TSolution> | undefined)[]> {
	const { actions, mode, parameters, state } = reducerInput
	const staticSolution = actions.some(({ action }) => action.type === 'input') ? await resolveStaticSolution(spec, parameters) : {}
	return await Promise.all(actions.map(async ({ action, userId }) => {
		if (action.type !== 'input') return undefined
		const input = valueOperations.interpretInput(action.input)
		const previousInputDependency = getInputDependency<TInputDependency>(state, mode, valueOperations, mode === 'group' ? action.adoptUserHistory ?? userId : userId)
		const inputDependency = await resolveUpdatedInputDependency(spec, { parameters, previousInputDependency, staticSolution, input, step })
		const solution = await resolveSolution(spec, parameters, inputDependency, staticSolution)
		return { rawInput: action.input, input, inputDependency, solution }
	}))
}

// Update the state with the input dependencies prepared for the current actions.
function addDependenciesToState<
	TState extends StepExerciseState,
	TSolution extends InputExerciseSolution,
	TInputDependency
>(
	state: TState,
	mode: 'solo' | 'group',
	actions: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions'],
	inputActionsData: readonly (InputActionData<TInputDependency, TSolution> | undefined)[],
	valueOperations: InputExerciseValueOperations,
	updateDependencies = true
): TState {
	if (!updateDependencies) return state
	return setInputDependencies(state, mode, inputActionsData.flatMap((inputActionData, index) => inputActionData === undefined ? [] : [{ userId: actions[index].userId, value: inputActionData.inputDependency }]), valueOperations)
}

// Check if a StepExercise is in split mode, meaning that it has been split into steps and is currently on a specific step.
function isStepExerciseSplitState(state: StepExerciseState): state is StepExerciseSplitState {
	return 'split' in state && state.split === true
}

// Advance the state of a StepExercise to the next step, marking it as done if it was the last step.
function advanceToNextStep(state: StepExerciseState, numSteps: number): StepExerciseState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid advanceToNextStep call: cannot advance a StepExercise that has not been split up yet.`)
	if (state.step === numSteps) return { ...state, done: true }
	const nextStep = state.step + 1
	return { ...state, step: nextStep, [nextStep]: {} }
}

// Get the state of a specific step in a StepExercise, throwing an error if the exercise is not in split mode.
function getStepState(state: StepExerciseState, step: number): StepExerciseStepState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid getStepState call: cannot get the state of a StepExercise that has not been split up yet.`)
	return state[`${step}`] ?? {}
}

// Get the user IDs of the users who have attempted to submit input in the current actions.
function getAttemptingUserIds(actions: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions']): (string | undefined)[] {
	return actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId)
}
