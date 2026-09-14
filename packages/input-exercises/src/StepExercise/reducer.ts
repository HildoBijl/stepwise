import type { PlainDataObject } from '@step-wise/js-utils'
import type { SkillSetupLike } from '@step-wise/skill-setup'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type GroupInputExerciseReport, type InputDependency, type InputExerciseAction, type InputExerciseInput, type InputExerciseParameters, type InputExerciseRawInput, type InputExerciseReport, type InputExerciseSolution, type InputExerciseValueOperations, type SoloInputExerciseReport, resolveSolution, resolveStaticSolution, resolveUpdatedInputDependency } from '../InputExercise/index.ts'
import { getGroupInputExerciseReport, mergeInputExerciseReports, normalizeCheckInputResult } from '../InputExercise/checkInput.ts'
import { deserializeInputExerciseParameters, serializeInputExerciseParameters } from '../InputExercise/parameterSerialization.ts'
import { createInputExerciseValueOperations } from '../InputExercise/valueOperations.ts'
import { type InputExerciseReducerInput, addAttemptsToState, getInputDependency, hasAttempted, setInputDependencies } from '../InputExercise/reducerSupport.ts'

import type { StepExerciseState, StepExerciseStepState, StepExerciseSplitState, StepExercise, StepExerciseSpec } from './types.ts'
import { ensureStepExerciseSteps } from './preprocessing.ts'
import { getCurrentStep } from './history.ts'

// Build a StepExercise from its author-facing spec.
export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution, TInputDependency = InputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>): StepExercise<TParameters, TSolution, TInputDependency> {
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

function buildStepExerciseSoloReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): SoloExerciseReducer<InputExerciseAction, StepExerciseState, PlainDataObject, SoloInputExerciseReport> {
	return async input => {
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueOperations.deserialize) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] }, valueOperations)
		return reports[0] === undefined ? { state } : { state, report: reports[0] }
	}
}

function buildStepExerciseGroupReducer<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, valueOperations: InputExerciseValueOperations): GroupExerciseReducer<InputExerciseAction, StepExerciseState, PlainDataObject, GroupInputExerciseReport> {
	return async input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: deserializeInputExerciseParameters<TParameters>(input.parameters, valueOperations.deserialize), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return { state: runtimeInput.state }
		const { state, reports } = await reduceActions(spec, runtimeInput, valueOperations)
		const report = getGroupInputExerciseReport(input.actions.map(({ userId }) => userId), reports)
		return report === undefined ? { state } : { state, report }
	}
}

type StepExerciseReduction = { state: StepExerciseState, reports: (InputExerciseReport | undefined)[] }

async function reduceActions<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<StepExerciseReduction> {
	return ('split' in input.state && input.state.split) ? await reduceCurrentStep(spec, input, valueOperations) : await reduceMainProblem(spec, input, valueOperations)
}

async function reduceMainProblem<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<StepExerciseReduction> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	let newState = addAttemptsToState(state, mode, getAttemptingUserIds(actions))
	const preparedActions = await prepareInputActions(spec, input, valueOperations, 0)
	newState = addPreparedInputDependencies(newState, mode, actions, preparedActions, valueOperations, spec.updateInputDependency !== undefined)
	const checkResults = await Promise.all(preparedActions.map(async prepared => prepared === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, rawInput: prepared.rawInput, input: prepared.input, solution: prepared.solution, areValuesEqual: valueOperations.areValuesEqual }, 0, 0))))
	const correct = checkResults.map(result => result.correct)
	const reports = checkResults.map(result => result.report)

	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			switch (action.type) {
				case 'input':
					if (metadata.skill) updateSkills(metadata.skill, correct[index], userId)
					if (metadata.setup) updateSkills(metadata.setup, correct[index], userId)
					return
				case 'giveUp': {
					const setup = metadata.skill ?? metadata.setup
					if (setup && isDone && !hasAttempted(state, mode, userId)) updateSkills(setup, false, userId)
					return
				}
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	if (someCorrect) return { state: { ...newState, solved: true, done: true }, reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...newState, split: true, step: 0 }, metadata.steps.length), reports }
	return { state: newState, reports }
}

async function reduceCurrentStep<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<StepExerciseReduction> {
	const step = getCurrentStep(input.state)
	const skill = spec.metadata.steps[step - 1]
	if (Array.isArray(skill)) return await reduceStepWithSubsteps(spec, input, valueOperations)
	return await reduceStepWithoutSubsteps(spec, input, valueOperations, skill)
}

async function reduceStepWithoutSubsteps<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations, skill: SkillSetupLike | undefined): Promise<StepExerciseReduction> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const stepState = getStepState(state, step)
	const newStepState = addAttemptsToState(stepState, mode, getAttemptingUserIds(actions))
	const preparedActions = await prepareInputActions(spec, input, valueOperations, step)
	const stateWithDependencies = addPreparedInputDependencies(state, mode, actions, preparedActions, valueOperations, spec.updateInputDependency !== undefined)
	const checkResults = await Promise.all(preparedActions.map(async prepared => prepared === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, rawInput: prepared.rawInput, input: prepared.input, solution: prepared.solution, areValuesEqual: valueOperations.areValuesEqual }, step, 0))))
	const correct = checkResults.map(result => result.correct)
	const reports = checkResults.map(result => result.report)

	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp
	if (updateSkills !== undefined) {
		actions.forEach((userAction, index) => {
			const { action, userId } = userAction
			switch (action.type) {
				case 'input':
					if (skill) updateSkills(skill, correct[index], userId)
					return

				case 'giveUp':
					if (skill && isDone && !hasAttempted(stepState, mode, userId)) updateSkills(skill, false, userId)
					return

				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	if (someCorrect) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...newStepState, solved: true, done: true } }, metadata.steps.length), reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...newStepState, givenUp: true, done: true } }, metadata.steps.length), reports }
	return { state: { ...stateWithDependencies, [step]: newStepState }, reports }
}

async function reduceStepWithSubsteps<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, input: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations): Promise<StepExerciseReduction> {
	const { metadata, checkInput } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const skill = metadata.steps[step - 1]
	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubsteps call: expected step ${step} to have substeps.`)

	// Prepare the input actions and update the input dependencies for the current step.
	const preparedActions = await prepareInputActions(spec, input, valueOperations, step)
	const stateWithDependencies = addPreparedInputDependencies(state, mode, actions, preparedActions, valueOperations, spec.updateInputDependency !== undefined)
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const previousStepState = getStepState(state, step)
	const stepState = addAttemptsToState({ ...previousStepState }, mode, getAttemptingUserIds(actions))
	const reports: (InputExerciseReport | undefined)[] = actions.map(() => undefined)
	for (const [index, subskill] of skill.entries()) {
		const substep = index + 1
		if (stepState[`${substep}`]) continue

		const checkResults = await Promise.all(preparedActions.map(async prepared => prepared === undefined ? { correct: false } : normalizeCheckInputResult(await checkInput({ metadata, parameters, rawInput: prepared.rawInput, input: prepared.input, solution: prepared.solution, areValuesEqual: valueOperations.areValuesEqual }, step, substep))))
		const correct = checkResults.map(result => result.correct)
		checkResults.forEach((result, resultIndex) => reports[resultIndex] = mergeInputExerciseReports(reports[resultIndex], result.report))
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp
		if (updateSkills !== undefined) {
			actions.forEach((userAction, index) => {
				const { action, userId } = userAction
				switch (action.type) {
					case 'input':
						if (subskill) updateSkills(subskill, correct[index], userId)
						return

					case 'giveUp':
						if (subskill && isDone && !hasAttempted(previousStepState, mode, userId)) updateSkills(subskill, false, userId)
						return

					default:
						throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
				}
			})
		}
		if (someCorrect) stepState[`${substep}`] = true
	}

	const everySubstepSolved = skill.every((_, index) => stepState[`${index + 1}`])
	if (everySubstepSolved) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...stepState, solved: true, done: true } }, metadata.steps.length), reports }
	if (allGaveUp) return { state: advanceToNextStep({ ...stateWithDependencies, [step]: { ...stepState, givenUp: true, done: true } }, metadata.steps.length), reports }
	return { state: { ...stateWithDependencies, [step]: stepState }, reports }
}

type PreparedInputAction<TSolution extends InputExerciseSolution, TInputDependency> = {
	rawInput: InputExerciseRawInput
	input: InputExerciseInput
	inputDependency: TInputDependency | undefined
	solution: TSolution | undefined
}

async function prepareInputActions<TParameters extends InputExerciseParameters, TSolution extends InputExerciseSolution, TInputDependency>(spec: StepExerciseSpec<TParameters, TSolution, TInputDependency>, reducerInput: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: InputExerciseValueOperations, step: number): Promise<(PreparedInputAction<TSolution, TInputDependency> | undefined)[]> {
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

function addPreparedInputDependencies<TState extends StepExerciseState, TSolution extends InputExerciseSolution, TInputDependency>(state: TState, mode: 'solo' | 'group', actions: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions'], preparedActions: readonly (PreparedInputAction<TSolution, TInputDependency> | undefined)[], valueOperations: InputExerciseValueOperations, updateDependencies = true): TState {
	if (!updateDependencies) return state
	return setInputDependencies(state, mode, preparedActions.flatMap((prepared, index) => prepared === undefined ? [] : [{ userId: actions[index].userId, value: prepared.inputDependency }]), valueOperations)
}

function isStepExerciseSplitState(state: StepExerciseState): state is StepExerciseSplitState {
	return 'split' in state && state.split === true
}

function advanceToNextStep(state: StepExerciseState, numSteps: number): StepExerciseState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid advanceToNextStep call: cannot advance a StepExercise that has not been split up yet.`)
	if (state.step === numSteps) return { ...state, done: true }
	const nextStep = state.step + 1
	return { ...state, step: nextStep, [nextStep]: {} }
}

function getStepState(state: StepExerciseState, step: number): StepExerciseStepState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid getStepState call: cannot get the state of a StepExercise that has not been split up yet.`)
	return state[`${step}`] ?? {}
}

function getAttemptingUserIds(actions: InputExerciseReducerInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions']): (string | undefined)[] {
	return actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId)
}
