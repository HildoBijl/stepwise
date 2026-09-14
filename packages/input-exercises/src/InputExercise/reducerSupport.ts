import { type ExerciseAction, type ExerciseMode, type ExerciseState, type UpdateSkills, throwUnsupportedExerciseMode } from '@step-wise/exercise-definition'
import type { SerializedData } from '@step-wise/serialization'

import type { InputDependency, InputExerciseParameters, InputExerciseReport, InputExerciseValueOperations } from './types.ts'

// Input dependency state: the part of the state depending on the input that may change the solution.
export type SoloInputExerciseDependencyState = Partial<{ inputDependency: SerializedData }>
export type GroupInputExerciseDependencyState = Partial<{ inputDependencies: Record<string, SerializedData> }>
export type InputExerciseDependencyState = SoloInputExerciseDependencyState & GroupInputExerciseDependencyState

// Attempt state: the part of the state indicating whether the user has attempted the exercise.
export type SoloInputExerciseAttemptState = Partial<{ attempted: true }>
export type GroupInputExerciseAttemptState = Partial<{ attemptedBy: string[] }>
export type InputExerciseAttemptState = SoloInputExerciseAttemptState & GroupInputExerciseAttemptState

// Reducer input: the input to the reducer functions for processing actions.
type InputExerciseUserAction<TAction extends ExerciseAction> = {
	userId?: string
	action: TAction
}
export type InputExerciseReducerInput<TAction extends ExerciseAction, TState extends ExerciseState, TParameters extends InputExerciseParameters> = {
	mode: ExerciseMode
	actions: readonly InputExerciseUserAction<TAction>[]
	parameters: TParameters
	state: TState
	updateSkills?: UpdateSkills
}

// Intermediate result before action reports are converted to their solo or group representation.
export type InputExerciseActionsReduction<TState extends ExerciseState> = {
	state: TState
	reports: (InputExerciseReport | undefined)[]
}

// Check in the state if a user has attempted an exercise (or step).
export function hasAttempted(state: InputExerciseAttemptState, mode: ExerciseMode, userId?: string): boolean {
	switch (mode) {
		case 'solo':
			return state.attempted === true

		case 'group':
			if (userId === undefined) throw new TypeError(`A userId is required when checking attempts for a group exercise.`)
			return state.attemptedBy?.includes(userId) ?? false

		default:
			return throwUnsupportedExerciseMode(mode)
	}
}

// Update the state to note that the given users attempted the exercise (or step).
export function addAttemptsToState<TState extends InputExerciseAttemptState>(state: TState, mode: ExerciseMode, userIds: readonly (string | undefined)[]): TState {
	if (userIds.length === 0) return state
	switch (mode) {
		case 'solo':
			return { ...state, attempted: true }

		case 'group': {
			const attemptedBy = new Set(state.attemptedBy)
			userIds.forEach(userId => {
				if (userId === undefined) throw new TypeError(`A userId is required when registering an attempt for a group exercise.`)
				attemptedBy.add(userId)
			})
			return { ...state, attemptedBy: [...attemptedBy] }
		}

		default:
			return throwUnsupportedExerciseMode(mode)
	}
}

// Get the input dependency for the given user (or solo) from the state, deserializing it for use.
export function getInputDependency<TInputDependency = InputDependency>(state: InputExerciseDependencyState, mode: ExerciseMode, valueOperations: InputExerciseValueOperations, userId?: string): TInputDependency | undefined {
	switch (mode) {
		case 'solo':
			return state.inputDependency === undefined ? undefined : valueOperations.deserialize(state.inputDependency) as TInputDependency

		case 'group': {
			if (userId === undefined) throw new TypeError(`A userId is required when getting an input dependency for a group exercise.`)
			const userDependency = state.inputDependencies?.[userId]
			if (userDependency !== undefined) return valueOperations.deserialize(userDependency) as TInputDependency
			return undefined
		}

		default:
			return throwUnsupportedExerciseMode(mode)
	}
}

// Apply the given input dependencies to the state, serializing them for storage.
export function setInputDependencies<TState extends InputExerciseDependencyState>(state: TState, mode: ExerciseMode, dependencies: readonly { userId?: string, value: unknown }[], valueOperations: InputExerciseValueOperations): TState {
	if (dependencies.length === 0) return state
	switch (mode) {
		case 'solo': {
			const { inputDependency: _, ...stateWithoutDependency } = state
			if (dependencies.length > 1) throw new TypeError(`Only one input dependency can be set for a solo exercise.`)
			const dependency = dependencies[0].value
			return (dependency === undefined ? stateWithoutDependency : { ...stateWithoutDependency, inputDependency: valueOperations.serialize(dependency) }) as TState
		}

		case 'group': {
			const inputDependencies = { ...state.inputDependencies }
			dependencies.forEach(({ userId, value }) => {
				if (userId === undefined) throw new TypeError(`A userId is required when setting an input dependency for a group exercise.`)
				if (value === undefined) delete inputDependencies[userId]
				else inputDependencies[userId] = valueOperations.serialize(value)
			})
			if (Object.keys(inputDependencies).length > 0) return { ...state, inputDependencies }
			const { inputDependencies: _, ...stateWithoutInputDependencies } = state
			return stateWithoutInputDependencies as TState
		}

		default:
			return throwUnsupportedExerciseMode(mode)
	}
}
