import { type Awaitable, type PlainDataObject, isPlainDataObject, isPlainObject } from '@step-wise/js-utils'
import type { GenerateExerciseParametersInput } from '@step-wise/exercise-definition'

import type { InputExerciseParameters, InputExerciseValueOperations } from './types.ts'

// Resolve author-facing parameters, which may contain registered runtime values before serialization.
export async function resolveInputExerciseParameters<TParameters extends InputExerciseParameters, TContext>(generateParameters: ((input: GenerateExerciseParametersInput<TContext>) => Awaitable<TParameters>) | undefined, input: GenerateExerciseParametersInput<TContext>): Promise<TParameters> {
	const parameters = generateParameters === undefined ? {} : await generateParameters(input)
	if (!isPlainObject(parameters)) throw new TypeError(`Invalid input-exercise parameters: expected generateParameters to return a plain object but received something of type "${typeof parameters}".`)
	return parameters as TParameters
}

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
