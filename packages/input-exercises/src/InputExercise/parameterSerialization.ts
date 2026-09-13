import { type PlainDataObject, isPlainDataObject } from '@step-wise/js-utils'

import type { InputExerciseParameters, InputExerciseValueOperations } from './types.ts'

// Serialize runtime parameters and ensure that the result is suitable for storage.
export function serializeInputExerciseParameters(parameters: InputExerciseParameters, serialize: InputExerciseValueOperations['serialize']): PlainDataObject {
	const serializedParameters = serialize(parameters)
	if (!isPlainDataObject(serializedParameters)) throw new TypeError('Invalid generated input-exercise parameters: serialization must result in a plain data object.')
	return serializedParameters
}

// Restore stored parameters before passing them to author-facing input-exercise logic.
export function deserializeInputExerciseParameters<TParameters extends InputExerciseParameters>(parameters: PlainDataObject, deserialize: InputExerciseValueOperations['deserialize']): TParameters {
	const deserializedParameters = deserialize(parameters)
	if (typeof deserializedParameters !== 'object' || deserializedParameters === null || Array.isArray(deserializedParameters)) throw new TypeError('Invalid stored input-exercise parameters: deserialization must result in an object.')
	return deserializedParameters as TParameters
}
