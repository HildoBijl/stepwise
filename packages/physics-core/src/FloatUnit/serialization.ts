import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

import { deserializeFloat, FloatType } from '../Float'
import { deserializeUnit, UnitType } from '../Unit'

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

export function deserializeFloatUnit(serializedFloatUnit: unknown): FloatUnit {
	if (!isPlainObject(serializedFloatUnit) || !hasOnlyKeys(serializedFloatUnit, ['type', 'value']) || serializedFloatUnit.type !== FloatUnitType || !Object.hasOwn(serializedFloatUnit, 'value')) throw new TypeError(`Invalid serialized FloatUnit: expected type "${FloatUnitType}" and a value.`)
	const value = serializedFloatUnit.value
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['float', 'unit']) || !Object.hasOwn(value, 'float') || !Object.hasOwn(value, 'unit')) throw new TypeError(`Invalid FloatUnitStorageValue: expected an object containing "float" and "unit".`)
	return new FloatUnit({
		float: deserializeFloat({ type: FloatType, value: value.float }),
		unit: deserializeUnit({ type: UnitType, value: value.unit }),
	})
}
