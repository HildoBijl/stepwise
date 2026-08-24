import { type PlainDataObject, isPlainDataObject } from '@step-wise/js-utils'
import { deserializeData, serializeData } from '@step-wise/serialization'

import type { InputExerciseParameters } from './types'

// Serialize runtime parameters and ensure that the result is suitable for storage.
export function serializeInputExerciseParameters(parameters: InputExerciseParameters): PlainDataObject {
	const serializedParameters = serializeData(parameters)
	if (!isPlainDataObject(serializedParameters)) throw new TypeError('Invalid generated input-exercise parameters: serialization must result in a plain data object.')
	return serializedParameters
}

// Restore stored parameters before passing them to author-facing input-exercise logic.
export function deserializeInputExerciseParameters<TParameters extends InputExerciseParameters>(parameters: PlainDataObject): TParameters {
	const deserializedParameters = deserializeData(parameters)
	if (typeof deserializedParameters !== 'object' || deserializedParameters === null || Array.isArray(deserializedParameters)) throw new TypeError('Invalid stored input-exercise parameters: deserialization must result in an object.')
	return deserializedParameters as TParameters
}
