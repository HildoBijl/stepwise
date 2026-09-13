import type { BaseExerciseInstanceByMode, ExerciseMode, ExerciseState } from '@step-wise/exercise-definition'

import type { InputExerciseAction, InputExerciseInput, InputExerciseRawInput, InputExerciseValueOperations } from './types.ts'
import { throwUnsupportedMode } from './modes.ts'

// Define a type with the minimally expected entries needed by history-inspecting functions.
export type InputExerciseHistoryData<TState extends ExerciseState = ExerciseState> = {
	[Mode in ExerciseMode]: Pick<BaseExerciseInstanceByMode<InputExerciseAction, TState>[Mode], 'mode' | 'initialState' | 'history'>
}[ExerciseMode]

export type LastInputOptions = {
	resolvedOnly?: boolean
}

export type AccumulatedInputOptions = LastInputOptions & {
	throughEventIndex?: number
}

// Get the last given raw input from the user. For group exercises, this may be an unresolved action input unless resolvedOnly is true.
export function getLastRawInput(instance: InputExerciseHistoryData, userId?: string, options: LastInputOptions = {}): InputExerciseRawInput | undefined {
	const { mode } = instance
	const { resolvedOnly = false } = options
	switch (mode) {
		case 'solo':
			for (let index = instance.history.length - 1; index >= 0; index--) {
				const action = instance.history[index].action
				if (action.type === 'input') return action.input
			}
			return undefined
		case 'group': {
			if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
			let historyUserId = userId
			for (let index = instance.history.length - 1; index >= 0; index--) {
				const event = instance.history[index]
				const action = event.actions.find(userAction => userAction.userId === historyUserId)?.action
				if (action?.type !== 'input') continue
				if (!resolvedOnly || 'state' in event) return action.input
				historyUserId = action.adoptUserHistory ?? historyUserId
			}
			return undefined
		}
		default:
			return throwUnsupportedMode(mode)
	}
}

// Combine a user's input actions through the requested history event. Later values overwrite earlier values with the same field ID.
export function getAccumulatedRawInput(instance: InputExerciseHistoryData, userId?: string, options: AccumulatedInputOptions = {}): InputExerciseRawInput | undefined {
	const { mode } = instance
	const { resolvedOnly = false, throughEventIndex = instance.history.length - 1 } = options
	const lastIndex = Math.min(throughEventIndex, instance.history.length - 1)

	// Set up accumulators.
	const input: InputExerciseRawInput = {}
	let hasInput = false
	const addInput = (action: InputExerciseAction | undefined) => {
		if (action?.type !== 'input') return
		Object.assign(input, action.input)
		hasInput = true
	}

	// Depending on the mode, walk through the actions and add respective inputs.
	switch (mode) {
		case 'solo':
			for (let index = 0; index <= lastIndex; index++) addInput(instance.history[index].action)
			break

		case 'group':
			if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
			let historyUserId = userId
			for (let index = lastIndex; index >= 0; index--) {
				const event = instance.history[index]
				const action = event.actions.find(userAction => userAction.userId === historyUserId)?.action
				if (action?.type !== 'input') continue
				if (!resolvedOnly || 'state' in event) {
					Object.entries(action.input).forEach(([id, value]) => {
						if (!(id in input)) input[id] = value
					})
					hasInput = true
				}
				historyUserId = action.adoptUserHistory ?? historyUserId
			}
			break

		default:
			return throwUnsupportedMode(mode)
	}

	return hasInput ? input : undefined
}

// Combine and interpret a user's input actions through the requested history event.
export function getAccumulatedInput(exercise: { valueOperations: InputExerciseValueOperations }, instance: InputExerciseHistoryData, userId?: string, options: AccumulatedInputOptions = {}): InputExerciseInput | undefined {
	const rawInput = getAccumulatedRawInput(instance, userId, options)
	return rawInput === undefined ? undefined : exercise.valueOperations.interpretInput(rawInput)
}

// Get the last given input from the user and interpret all its values.
export function getLastInput(exercise: { valueOperations: InputExerciseValueOperations }, instance: InputExerciseHistoryData, userId?: string, options: LastInputOptions = {}): InputExerciseInput | undefined {
	const rawInput = getLastRawInput(instance, userId, options)
	return rawInput === undefined ? undefined : exercise.valueOperations.interpretInput(rawInput)
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(instance: InputExerciseHistoryData, userId?: string): boolean {
	return getLastRawInput(instance, userId) !== undefined
}
