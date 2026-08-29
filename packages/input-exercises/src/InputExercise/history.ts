import { interpretInputData } from '@step-wise/input-interpretation'
import { type ValueTypes, extractInputValueAdapters } from '@step-wise/value-types'

import type { InputExerciseHistoryInstance, InputExerciseInput, InputExerciseRawInput } from './types.ts'

export type LastInputOptions = {
	resolvedOnly?: boolean
}

// Get the last given raw input from the user. For group exercises, this may be an unresolved action input unless resolvedOnly is true.
export function getLastRawInput(instance: InputExerciseHistoryInstance, userId?: string, options: LastInputOptions = {}): InputExerciseRawInput | undefined {
	const { resolvedOnly = false } = options
	if (instance.mode === 'solo') for (let index = instance.history.length - 1; index >= 0; index--) {
		const userAction = instance.history[index].action
		if (userAction.type === 'input') return userAction.input
	}

	if (instance.mode === 'group') {
		if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
		for (let index = instance.history.length - 1; index >= 0; index--) {
			// Determine the action of the user in this piece of history.
			const event = instance.history[index]
			const userAction = (!resolvedOnly || 'state' in event) ? event.actions.find(userAction => userAction.userId === userId)?.action : undefined

			// If there is no valid input action, keep looking. Otherwise give the input.
			if (!userAction || userAction.type !== 'input') continue
			return userAction.input
		}
	}
	return undefined
}

// Get the last given input from the user and interpret all its values.
export function getLastInput(exercise: { valueTypes?: ValueTypes }, instance: InputExerciseHistoryInstance, userId?: string, options: LastInputOptions = {}): InputExerciseInput | undefined {
	const rawInput = getLastRawInput(instance, userId, options)
	return rawInput === undefined ? undefined : interpretInputData(rawInput, extractInputValueAdapters(exercise.valueTypes ?? {}))
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(instance: InputExerciseHistoryInstance, userId?: string): boolean {
	return getLastRawInput(instance, userId) !== undefined
}
