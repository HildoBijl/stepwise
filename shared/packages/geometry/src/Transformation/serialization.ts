import { type TransformationData } from './types'
import { Transformation } from './Transformation'

export type SerializedTransformation = {
	type: typeof Transformation.type
	value: TransformationData
}

export function serializeTransformation(transformation: Transformation): SerializedTransformation {
	return {
		type: Transformation.type,
		value: transformation.toStorageValue(),
	}
}

export function deserializeTransformation(serializedTransformation: SerializedTransformation): Transformation {
	return Transformation.fromStorageValue(serializedTransformation.value)
}
