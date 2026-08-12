import { type FloatUnitStorageValue, FloatUnitType } from './interpreting'
import { FloatUnit } from './FloatUnit'

export type SerializedFloatUnit = {
	type: FloatUnitType
	value: FloatUnitStorageValue
}

export function serializeFloatUnit(floatUnit: FloatUnit): SerializedFloatUnit {
	return {
		type: FloatUnitType,
		value: floatUnit.toStorageValue(),
	}
}

export function deserializeFloatUnit(serializedFloatUnit: SerializedFloatUnit): FloatUnit {
	return new FloatUnit(serializedFloatUnit.value)
}
