import { isPlainObject, hasOnlyKeys } from '@step-wise/js-utils'

import { type PrecisionNumberInputData, isPrecisionNumberInputValue, interpretPrecisionNumberInputValue, precisionNumberToInputValue } from '../PrecisionNumber/index.ts'
import { type UnitInputData, isUnitInputValue, interpretUnitInputValue, unitToInputValue } from '../Unit/index.ts'

import { Quantity } from './Quantity.ts'

export type QuantityInputData = {
	value: PrecisionNumberInputData
	unit?: UnitInputData
}

export function isQuantityInputValue(value: unknown): value is QuantityInputData {
	if (!isPlainObject(value) || !hasOnlyKeys(value, ['value', 'unit'])) return false
	const { value: numericValue, unit } = value as QuantityInputData
	return isPrecisionNumberInputValue(numericValue) && (unit === undefined || isUnitInputValue(unit))
}

export function interpretQuantityInputValue(value: QuantityInputData): Quantity {
	return new Quantity({
		value: interpretPrecisionNumberInputValue(value.value),
		unit: value.unit === undefined ? undefined : interpretUnitInputValue(value.unit),
	})
}

export function quantityToInputValue(quantity: Quantity): QuantityInputData {
	return {
		value: precisionNumberToInputValue(quantity.value),
		...(quantity.unit.isEmpty() ? {} : { unit: unitToInputValue(quantity.unit) }),
	}
}
