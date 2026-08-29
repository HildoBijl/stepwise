import { type PlainDataObject, isPlainDataObject } from '@step-wise/js-utils'
import { type SerializationAdapters, deserializeData, serializeData } from '@step-wise/serialization'

import type { InputExerciseParameters } from './types.ts'

// Serialize runtime parameters and ensure that the result is suitable for storage.
export function serializeInputExerciseParameters(parameters: InputExerciseParameters, serializationAdapters?: SerializationAdapters): PlainDataObject {
	const serializedParameters = serializeData(parameters, serializationAdapters)
	if (!isPlainDataObject(serializedParameters)) throw new TypeError('Invalid generated input-exercise parameters: serialization must result in a plain data object.')
	return serializedParameters
}

// Restore stored parameters before passing them to author-facing input-exercise logic.
export function deserializeInputExerciseParameters<TParameters extends InputExerciseParameters>(parameters: PlainDataObject, serializationAdapters?: SerializationAdapters): TParameters {
	const deserializedParameters = deserializeData(parameters, serializationAdapters)
	if (typeof deserializedParameters !== 'object' || deserializedParameters === null || Array.isArray(deserializedParameters)) throw new TypeError('Invalid stored input-exercise parameters: deserialization must result in an object.')
	return deserializedParameters as TParameters
}
