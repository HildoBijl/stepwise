import type { SkillSetupLike } from '@step-wise/skill-setup'
import { type GroupExerciseReducer, type SoloExerciseReducer, resolveExerciseParameters } from '@step-wise/exercise-definition'

import { type InputExerciseAction, type InputExerciseParameters, type InputExerciseSolution, type ValueOperations, resolveSolution } from '../InputExercise/index.ts'
import { createValueInfrastructure } from '../InputExercise/valueOperations.ts'
import { type InputExerciseReducerActionsInput, addAttemptsToState, hasAttempted } from '../reducerSupport.ts'

import type { StepExerciseState, StepExerciseStepState, StepExerciseSplitState, StepExercise, StepExerciseSpec } from './types.ts'
import { ensureStepExerciseSteps } from './preprocessing.ts'
import { getCurrentStep } from './support.ts'

// Build a StepExercise from its author-facing spec.
export function buildStepExercise<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>): StepExercise<TParameters, TSolution> {
	ensureStepExerciseSteps(spec.metadata.steps)
	const { valueTypes, ...definition } = spec
	const { valueOperations, serializeParameters } = createValueInfrastructure(valueTypes)
	return {
		...definition,
		valueOperations,
		type: 'step',
		generateParameters: example => serializeParameters(resolveExerciseParameters(spec.generateParameters, example)),
		getInitialState: () => ({}),
		processSoloAction: buildStepExerciseSoloReducer(spec, valueOperations),
		processGroupActions: buildStepExerciseGroupReducer(spec, valueOperations),
	}
}

function buildStepExerciseSoloReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, valueOperations: ValueOperations): SoloExerciseReducer<InputExerciseAction, StepExerciseState> {
	return input => {
		const runtimeInput = { ...input, parameters: valueOperations.deserializeParameters<TParameters>(input.parameters) }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, { ...runtimeInput, mode: 'solo', actions: [{ action: input.action }] }, valueOperations)
	}
}

function buildStepExerciseGroupReducer<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, valueOperations: ValueOperations): GroupExerciseReducer<InputExerciseAction, StepExerciseState> {
	return input => {
		if (input.actions.length === 0) throw new Error(`Cannot resolve a group exercise without actions.`)
		const runtimeInput = { ...input, parameters: valueOperations.deserializeParameters<TParameters>(input.parameters), mode: 'group' as const }
		if ('done' in runtimeInput.state && runtimeInput.state.done) return runtimeInput.state
		return reduceActions(spec, runtimeInput, valueOperations)
	}
}

// Reduce a normalized set of solo or group actions.
function reduceActions<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: ValueOperations): StepExerciseState {
	return ('split' in input.state && input.state.split) ? reduceCurrentStep(spec, input, valueOperations) : reduceMainProblem(spec, input, valueOperations)
}

// Reduce a set of actions for the main problem.
function reduceMainProblem<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: ValueOperations): StepExerciseState {
	const { metadata, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const newState = addAttemptsToState(state, mode, getAttemptingUserIds(actions))

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = valueOperations.interpretInput(userAction.action.input)
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution, areValuesEqual: valueOperations.areValuesEqual }, 0, 0)
	})

	// If any userAction is correct, or if all gave up, the exercise is done.
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
				case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
					const setup = metadata.skill ?? metadata.setup
					if (setup && isDone && !hasAttempted(state, mode, userId)) updateSkills(setup, false, userId)
					return
				default:
					throw new Error(`Invalid action type: received an action "${JSON.stringify(action)}" which cannot be processed.`)
			}
		})
	}

	// Determine the new state.
	if (someCorrect) return { ...newState, solved: true, done: true }
	if (allGaveUp) return advanceToNextStep({ ...newState, split: true, step: 0 }, metadata.steps.length)
	return newState
}

// Reduce a set of actions for a step.
function reduceCurrentStep<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: ValueOperations): StepExerciseState {
	const { metadata } = spec
	const { state } = input
	const step = getCurrentStep(state)
	const skill = metadata.steps[step - 1]
	if (Array.isArray(skill)) return reduceStepWithSubsteps(spec, input, valueOperations)
	return reduceStepWithoutSubsteps(spec, input, valueOperations, skill)
}

function reduceStepWithoutSubsteps<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: ValueOperations, skill: SkillSetupLike | undefined): StepExerciseState {
	const { metadata, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const stepState = getStepState(state, step)
	const newStepState = addAttemptsToState(stepState, mode, getAttemptingUserIds(actions))

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Check all input actions.
	const correct = actions.map(userAction => {
		if (userAction.action.type !== 'input') return false
		const exerciseInput = valueOperations.interpretInput(userAction.action.input)
		const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
		return checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution, areValuesEqual: valueOperations.areValuesEqual }, step, 0)
	})

	// If any userAction is correct, or if all gave up, the step is done.
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

	// Determine the new state.
	if (someCorrect) return advanceToNextStep({ ...state, [step]: { ...newStepState, solved: true, done: true } }, metadata.steps.length)
	if (allGaveUp) return advanceToNextStep({ ...state, [step]: { ...newStepState, givenUp: true, done: true } }, metadata.steps.length)
	return { ...state, [step]: newStepState }
}

function reduceStepWithSubsteps<TParameters extends InputExerciseParameters = InputExerciseParameters, TSolution extends InputExerciseSolution = InputExerciseSolution>(spec: StepExerciseSpec<TParameters, TSolution>, input: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, TParameters>, valueOperations: ValueOperations): StepExerciseState {
	const { metadata, checkInput, getSolution } = spec
	const { mode, state, actions, parameters, updateSkills } = input
	const step = getCurrentStep(state)
	const skill = metadata.steps[step - 1]
	if (!Array.isArray(skill)) throw new Error(`Invalid reduceStepWithSubsteps call: expected step ${step} to have substeps.`)

	// Get the solution of the exercise, if it exists, does not depend on input, and is actually needed.
	const staticSolution = typeof getSolution === 'function' && actions.some(userAction => userAction.action.type === 'input') ? getSolution(parameters) : undefined

	// Walk through the substeps and check them one by one.
	const allGaveUp = actions.every(userAction => userAction.action.type === 'giveUp')
	const previousStepState = getStepState(state, step)
	const stepState = addAttemptsToState({ ...previousStepState }, mode, getAttemptingUserIds(actions))
	skill.forEach((subskill, index) => {
		// Ignore already completed substeps.
		const substep = index + 1
		if (stepState[`${substep}`]) return

		// Check all input actions.
		const correct = actions.map(userAction => {
			if (userAction.action.type !== 'input') return false
			const exerciseInput = valueOperations.interpretInput(userAction.action.input)
			const solution = staticSolution ?? (getSolution ? resolveSolution(getSolution, parameters, exerciseInput) : undefined)
			return checkInput({ metadata, parameters, rawInput: userAction.action.input, input: exerciseInput, solution, areValuesEqual: valueOperations.areValuesEqual }, step, substep)
		})
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp

		// Run the skill updates for the skill of this step.
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

		// Remember correct substeps.
		if (someCorrect) stepState[`${substep}`] = true
	})

	// Determine the new state, given the substep state.
	const everySubstepSolved = skill.every((_, index) => stepState[`${index + 1}`])
	if (everySubstepSolved) return advanceToNextStep({ ...state, [step]: { ...stepState, solved: true, done: true } }, metadata.steps.length)
	if (allGaveUp) return advanceToNextStep({ ...state, [step]: { ...stepState, givenUp: true, done: true } }, metadata.steps.length)
	return { ...state, [step]: stepState }
}

function isStepExerciseSplitState(state: StepExerciseState): state is StepExerciseSplitState {
	return 'split' in state && state.split === true
}

// Move state to the next step, or mark the full exercise done.
function advanceToNextStep(state: StepExerciseState, numSteps: number): StepExerciseState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid advanceToNextStep call: cannot advance a StepExercise that has not been split up yet.`)
	if (state.step === numSteps) return { ...state, done: true }
	const nextStep = state.step + 1
	return { ...state, step: nextStep, [nextStep]: {} }
}

// Get a step within the state and ensure it's typed correctly.
function getStepState(state: StepExerciseState, step: number): StepExerciseStepState {
	if (!isStepExerciseSplitState(state)) throw new Error(`Invalid getStepState call: cannot get the state of a StepExercise that has not been split up yet.`)
	return state[`${step}`] ?? {}
}

function getAttemptingUserIds(actions: InputExerciseReducerActionsInput<InputExerciseAction, StepExerciseState, InputExerciseParameters>['actions']): (string | undefined)[] {
	return actions.filter(userAction => userAction.action.type === 'input').map(userAction => userAction.userId)
}
