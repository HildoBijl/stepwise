import { interpretAllInputValues } from '@step-wise/input-interpretation'
import { type PlainDataObject, isPlainDataObject } from '@step-wise/js-utils'
import { deserializeAll, serializeAll } from '@step-wise/serialization'
import type { InputExerciseParameters, InputExerciseAction, InputExerciseHistoryInstance, InputExerciseInput, InputExerciseInputValue } from './types'

// Serialize runtime parameters and ensure that the result is suitable for storage.
export function serializeInputExerciseParameters(parameters: InputExerciseParameters): PlainDataObject {
	const serializedParameters = serializeAll(parameters)
	if (!isPlainDataObject(serializedParameters)) throw new TypeError('Invalid generated input-exercise parameters: serialization must result in a plain data object.')
	return serializedParameters
}

// Restore stored parameters before passing them to author-facing input-exercise logic.
export function deserializeInputExerciseParameters<TParameters extends InputExerciseParameters>(parameters: PlainDataObject): TParameters {
	const deserializedParameters = deserializeAll(parameters)
	if (typeof deserializedParameters !== 'object' || deserializedParameters === null || Array.isArray(deserializedParameters)) throw new TypeError('Invalid stored input-exercise parameters: deserialization must result in an object.')
	return deserializedParameters as TParameters
}

// Get the last given raw input from the user. For group exercises, this may be an unresolved action input, unless the requireResolved flag is true.
export function getLastRawInput(instance: InputExerciseHistoryInstance, userId?: string, requireResolved = false): InputExerciseInputValue | undefined {
	if (instance.mode === 'solo') for (let index = instance.history.length - 1; index >= 0; index--) {
		const userAction = instance.history[index].action
		if (userAction.type === 'input') return userAction.input
	}

	if (instance.mode === 'group') {
		if (userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)
		for (let index = instance.history.length - 1; index >= 0; index--) {
			// Determine the action of the user in this piece of history.
			const event = instance.history[index]
			const userAction = (!requireResolved || 'state' in event) ? event.actions.find(userAction => userAction.userId === userId)?.action : undefined

			// If there is no valid input action, keep looking. Otherwise give the input.
			if (!userAction || userAction.type !== 'input') continue
			return userAction.input
		}
	}
	return undefined
}

// Get the last given input from the user and interpret all its values.
export function getLastInput(instance: InputExerciseHistoryInstance, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	const rawInput = getLastRawInput(instance, userId, requireResolved)
	return rawInput === undefined ? undefined : interpretAllInputValues(rawInput) as InputExerciseInput
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(instance: InputExerciseHistoryInstance, userId?: string): boolean {
	return getLastRawInput(instance, userId) !== undefined
}
