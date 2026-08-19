
import { isPlainDataObject, type PlainDataObject } from '@step-wise/js-utils'
import { deserializeAll, serializeAll } from '@step-wise/serialization'
import type { ExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseState, InputExerciseAction, InputExerciseInput } from './types'

// Serialize a runtime state and ensure that the result is suitable for storage.
export function serializeInputExerciseState(state: InputExerciseState): PlainDataObject {
	const serializedState = serializeAll(state)
	if (!isPlainDataObject(serializedState)) throw new TypeError('Invalid generated input-exercise state: serialization must result in a plain data object.')
	return serializedState
}

// Restore a stored state before passing it to author-facing input-exercise logic.
export function deserializeInputExerciseState<TState extends InputExerciseState>(state: PlainDataObject): TState {
	const deserializedState = deserializeAll(state)
	if (typeof deserializedState !== 'object' || deserializedState === null || Array.isArray(deserializedState)) throw new TypeError('Invalid stored input-exercise state: deserialization must result in an object.')
	return deserializedState as TState
}

// Get the last given input from the user. For group-exercises, this may be an unresolved submission input, unless the requireResolved flag is set to true.
export function getLastInput(history: ExerciseHistory<InputExerciseAction>, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	if (history.mode === 'group' && userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)

	if (history.mode === 'solo') for (let index = history.events.length - 1; index >= 0; index--) {
		const userAction = history.events[index].action
		if (userAction.type === 'input') return userAction.input
	}

	if (history.mode === 'group') for (let index = history.events.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = history.events[index]
		const userAction = (!requireResolved || 'progress' in event) ? event.submissions.find(submission => submission.userId === userId)?.action : undefined

		// If there is no valid input action, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		return userAction.input
	}
	return undefined
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(history: ExerciseHistory<InputExerciseAction>, userId?: string): boolean {
	return !!getLastInput(history, userId)
}
