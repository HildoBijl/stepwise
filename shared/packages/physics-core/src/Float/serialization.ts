import { type FloatStorageValue, FloatType } from './interpreting'
import { Float } from './Float'

export type SerializedFloat = {
	type: FloatType
	value: FloatStorageValue
}

export function serializeFloat(float: Float): SerializedFloat {
	return {
		type: FloatType,
		value: float.toStorageValue(),
	}
}

export function deserializeFloat(serializedFloat: SerializedFloat): Float {
	return new Float(serializedFloat.value)
}
