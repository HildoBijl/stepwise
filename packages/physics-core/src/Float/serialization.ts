import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

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

export function deserializeFloat(serializedFloat: unknown): Float {
	if (!isPlainObject(serializedFloat) || !hasOnlyKeys(serializedFloat, ['type', 'value']) || serializedFloat.type !== FloatType || !Object.hasOwn(serializedFloat, 'value')) throw new TypeError(`Invalid serialized Float: expected type "${FloatType}" and a value.`)
	return new Float(serializedFloat.value as FloatStorageValue)
}
