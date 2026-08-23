import { isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { type PrecisionNumberInputValue, isPrecisionNumberInputValue, interpretPrecisionNumberInputValue, precisionNumberToInputValue } from '../PrecisionNumber'
import { type UnitInputValue, isUnitInputValue, interpretUnitInputValue, unitToInputValue } from '../Unit'

import { FloatUnit } from './FloatUnit'

export type FloatUnitInputValue = {
	value: PrecisionNumberInputValue
	unit?: UnitInputValue
}

export function isFloatUnitInputValue(value: unknown): value is FloatUnitInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit'])) return false
	const { value: numericValue, unit } = value as FloatUnitInputValue
	return isPrecisionNumberInputValue(numericValue) && (unit === undefined || isUnitInputValue(unit))
}

export function interpretFloatUnitInputValue(value: FloatUnitInputValue): FloatUnit {
	return new FloatUnit({
		value: interpretPrecisionNumberInputValue(value.value),
		unit: value.unit === undefined ? undefined : interpretUnitInputValue(value.unit),
	})
}

export function floatUnitToInputValue(floatUnit: FloatUnit): FloatUnitInputValue {
	return {
		value: precisionNumberToInputValue(floatUnit.value),
		...(floatUnit.unit.isEmpty() ? {} : { unit: unitToInputValue(floatUnit.unit) }),
	}
}
