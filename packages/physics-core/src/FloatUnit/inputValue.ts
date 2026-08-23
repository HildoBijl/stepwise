import { isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { type FloatInputValue, isFloatInputValue, interpretFloatInputValue, floatToInputValue } from '../Float'
import { type UnitInputValue, isUnitInputValue, interpretUnitInputValue, unitToInputValue } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type FloatUnitInputValue = {
	value: FloatInputValue
	unit?: UnitInputValue
}

export function isFloatUnitInputValue(value: unknown): value is FloatUnitInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit'])) return false
	const { value: numericValue, unit } = value as FloatUnitInputValue
	return isFloatInputValue(numericValue) && (unit === undefined || isUnitInputValue(unit))
}

export function interpretFloatUnitInputValue(value: FloatUnitInputValue): FloatUnit {
	return new FloatUnit({
		value: interpretFloatInputValue(value.value),
		unit: value.unit === undefined ? undefined : interpretUnitInputValue(value.unit),
	})
}

export function floatUnitToInputValue(floatUnit: FloatUnit): FloatUnitInputValue {
	return {
		value: floatToInputValue(floatUnit.value),
		...(floatUnit.unit.isEmpty() ? {} : { unit: unitToInputValue(floatUnit.unit) }),
	}
}
