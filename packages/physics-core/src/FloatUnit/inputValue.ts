import { isPlainObject, onlyHasKeys } from '@step-wise/utils'

import { type FloatInputValue, isFloatInputValue, interpretFloatInputValue, floatToInputValue } from '../Float'
import { type UnitInputValue, isUnitInputValue, interpretUnitInputValue, unitToInputValue } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type FloatUnitInputValue = {
	float: FloatInputValue
	unit?: UnitInputValue
}

export function isFloatUnitInputValue(value: unknown): value is FloatUnitInputValue {
	if (!isPlainObject(value) || !onlyHasKeys(value, ['float', 'unit'])) return false
	const { float, unit } = value as FloatUnitInputValue
	return isFloatInputValue(float) && (unit === undefined || isUnitInputValue(unit))
}

export function interpretFloatUnitInputValue(value: FloatUnitInputValue): FloatUnit {
	return new FloatUnit({
		float: interpretFloatInputValue(value.float),
		unit: value.unit === undefined ? undefined : interpretUnitInputValue(value.unit),
	})
}

export function floatUnitToInputValue(floatUnit: FloatUnit): FloatUnitInputValue {
	return {
		float: floatToInputValue(floatUnit.float),
		...(floatUnit.unit.isEmpty() ? {} : { unit: unitToInputValue(floatUnit.unit) }),
	}
}
