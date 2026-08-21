
import { isPlainDataObject, type PlainDataObject } from '@step-wise/js-utils'
import { deserializeAll, serializeAll } from '@step-wise/serialization'
import type { ExerciseHistory, ExerciseMode, GroupExerciseHistory, SoloExerciseHistory } from '@step-wise/exercise-definition'

import type { InputExerciseParameters, InputExerciseAction, InputExerciseInput } from './types'

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

// Get the last given input from the user. For group-exercises, this may be an unresolved submission input, unless the requireResolved flag is set to true.
export function getLastInput(mode: ExerciseMode, history: ExerciseHistory<InputExerciseAction>, userId?: string, requireResolved = false): InputExerciseInput | undefined {
	if (mode === 'group' && userId === undefined) throw new TypeError(`A userId is required when retrieving input from a group exercise history.`)

	if (mode === 'solo') for (let index = history.length - 1; index >= 0; index--) {
		const userAction = (history as SoloExerciseHistory<InputExerciseAction>)[index].action
		if (userAction.type === 'input') return userAction.input
	}

	if (mode === 'group') for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of history.
		const event = (history as GroupExerciseHistory<InputExerciseAction>)[index]
		const userAction = (!requireResolved || 'progress' in event) ? event.submissions.find(submission => submission.userId === userId)?.action : undefined

		// If there is no valid input action, keep looking. Otherwise give the input.
		if (!userAction || userAction.type !== 'input') continue
		return userAction.input
	}
	return undefined
}

// Check if a user has made a previous input at the given step.
export function hasPreviousInput(mode: ExerciseMode, history: ExerciseHistory<InputExerciseAction>, userId?: string): boolean {
	return !!getLastInput(mode, history, userId)
}
