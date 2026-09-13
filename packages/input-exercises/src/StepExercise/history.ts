import { ensureInteger } from '@step-wise/js-utils'

import type { InputExerciseHistoryData, LastInputOptions } from '../InputExercise/history.ts'
import { throwUnsupportedMode } from '../InputExercise/modes.ts'
import type { InputExerciseInput, InputExerciseRawInput, InputExerciseValueOperations } from '../InputExercise/types.ts'

import type { StepExerciseState } from './types.ts'

// Get the step which this exercise's state is at.
export function getCurrentStep(state: StepExerciseState | Record<string, never>): number {
	return 'step' in state && typeof state.step === 'number' ? state.step : 0
}

// Get the last given raw input from the user at the given step.
export function getLastRawInputAtStep(instance: InputExerciseHistoryData<StepExerciseState>, step: number, userId?: string, options: LastInputOptions = {}): InputExerciseRawInput | undefined {
	step = ensureInteger(step, { nonNegative: true })
	const { resolvedOnly = false } = options
	const { mode } = instance

	switch (mode) {
		case 'solo':
			for (let index = instance.history.length - 1; index >= 0; index--) {
				const userAction = instance.history[index].action
				if (userAction.type !== 'input') continue
				if (getCurrentStep(getStateBeforeEvent(instance, index)) === step) return userAction.input
			}
			return undefined

		case 'group': {
			if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
			let historyUserId = userId
			for (let index = instance.history.length - 1; index >= 0; index--) {
				const event = instance.history[index]
				const userAction = event.actions.find(userAction => userAction.userId === historyUserId)?.action
				if (!userAction || userAction.type !== 'input') continue
				if ((!resolvedOnly || 'state' in event) && getCurrentStep(getStateBeforeEvent(instance, index)) === step) return userAction.input
				historyUserId = userAction.adoptUserHistory ?? historyUserId
			}
			return undefined
		}

		default:
			return throwUnsupportedMode(mode)
	}
}

// Get the last given input from the user at the given step and interpret all its values.
export function getLastInputAtStep(exercise: { valueOperations: InputExerciseValueOperations }, instance: InputExerciseHistoryData<StepExerciseState>, step: number, userId?: string, options: LastInputOptions = {}): InputExerciseInput | undefined {
	const rawInput = getLastRawInputAtStep(instance, step, userId, options)
	return rawInput === undefined ? undefined : exercise.valueOperations.interpretInput(rawInput)
}

function getStateBeforeEvent(instance: InputExerciseHistoryData<StepExerciseState>, eventIndex: number): StepExerciseState {
	if (eventIndex === 0) return instance.initialState
	const previousEvent = instance.history[eventIndex - 1]
	if (!('state' in previousEvent)) throw new Error(`Cannot determine the state before an event because the preceding event is unresolved.`)
	return previousEvent.state
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInputAtStep(instance: InputExerciseHistoryData<StepExerciseState>, step: number, userId?: string): boolean {
	return getLastRawInputAtStep(instance, step, userId) !== undefined
}
