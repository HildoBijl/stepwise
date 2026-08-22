import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { ensureInteger } from '@step-wise/js-utils'

import type { InputExerciseHistoryInstance, InputExerciseInput, InputExerciseRawInput, LastInputOptions } from '../InputExercise'

import type { StepExerciseState } from './types'

// Get the step which this problem is at.
export function getCurrentStep(state: StepExerciseState | Record<string, never>): number {
	return 'step' in state && typeof state.step === 'number' ? state.step : 0
}

// Get the last given raw input from the user at the given step.
export function getLastRawInputAtStep(instance: InputExerciseHistoryInstance<StepExerciseState>, step: number, userId?: string, options: LastInputOptions = {}): InputExerciseRawInput | undefined {
	step = ensureInteger(step, { nonNegative: true })
	const { resolvedOnly = false } = options

	if (instance.mode === 'solo') for (let index = instance.history.length - 1; index >= 0; index--) {
		const userAction = instance.history[index].action
		if (userAction.type !== 'input') continue
		if (getCurrentStep(getStateBeforeEvent(instance, index)) === step) return userAction.input
	}

	if (instance.mode === 'group') {
		if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
		for (let index = instance.history.length - 1; index >= 0; index--) {
			const event = instance.history[index]
			const userAction = (!resolvedOnly || 'state' in event) ? event.actions.find(userAction => userAction.userId === userId)?.action : undefined
			if (!userAction || userAction.type !== 'input') continue
			if (getCurrentStep(getStateBeforeEvent(instance, index)) === step) return userAction.input
		}
	}
	return undefined
}

// Get the last given input from the user at the given step and interpret all its values.
export function getLastInputAtStep(instance: InputExerciseHistoryInstance<StepExerciseState>, step: number, userId?: string, options: LastInputOptions = {}): InputExerciseInput | undefined {
	const rawInput = getLastRawInputAtStep(instance, step, userId, options)
	return rawInput === undefined ? undefined : interpretAllInputValues(rawInput) as InputExerciseInput
}

function getStateBeforeEvent(instance: InputExerciseHistoryInstance<StepExerciseState>, eventIndex: number): StepExerciseState {
	for (let index = eventIndex - 1; index >= 0; index--) {
		const event = instance.history[index]
		if ('state' in event) return event.state
	}
	return instance.initialState
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInputAtStep(instance: InputExerciseHistoryInstance<StepExerciseState>, step: number, userId?: string): boolean {
	return getLastRawInputAtStep(instance, step, userId) !== undefined
}
