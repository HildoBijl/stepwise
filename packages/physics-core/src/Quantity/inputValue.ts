import { isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { type PrecisionNumberInputValue, isPrecisionNumberInputValue, interpretPrecisionNumberInputValue, precisionNumberToInputValue } from '../PrecisionNumber'
import { type UnitInputValue, isUnitInputValue, interpretUnitInputValue, unitToInputValue } from '../Unit'

import { Quantity } from './Quantity'

export type QuantityInputValue = {
	value: PrecisionNumberInputValue
	unit?: UnitInputValue
}

export function isQuantityInputValue(value: unknown): value is QuantityInputValue {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit'])) return false
	const { value: numericValue, unit } = value as QuantityInputValue
	return isPrecisionNumberInputValue(numericValue) && (unit === undefined || isUnitInputValue(unit))
}

export function interpretQuantityInputValue(value: QuantityInputValue): Quantity {
	return new Quantity({
		value: interpretPrecisionNumberInputValue(value.value),
		unit: value.unit === undefined ? undefined : interpretUnitInputValue(value.unit),
	})
}

export function quantityToInputValue(quantity: Quantity): QuantityInputValue {
	return {
		value: precisionNumberToInputValue(quantity.value),
		...(quantity.unit.isEmpty() ? {} : { unit: unitToInputValue(quantity.unit) }),
	}
}
