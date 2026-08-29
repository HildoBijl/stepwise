import { type PrecisionNumberEqualityOptionsInput, PrecisionNumber, PrecisionNumberType, isPrecisionNumberEqualityOptionsInput } from '@step-wise/physics-core'
import { type UnitEqualityOptionsInput, Unit, UnitType, isUnitEqualityOptionsInput } from '@step-wise/physics-core'
import { type QuantityEqualityOptionsInput, Quantity, QuantityType, isQuantityEqualityOptionsInput } from '@step-wise/physics-core'
import type { ValueEqualityAdapter } from '@step-wise/value-equality'

export function arePrecisionNumbersEqual(inputValue: PrecisionNumber, expectedValue: PrecisionNumber, options?: PrecisionNumberEqualityOptionsInput): boolean {
	return expectedValue.equals(inputValue, options)
}

export function areUnitsEqual(inputValue: Unit, expectedValue: Unit, options?: UnitEqualityOptionsInput): boolean {
	return expectedValue.equals(inputValue, options)
}

export function areQuantitiesEqual(inputValue: Quantity, expectedValue: Quantity, options?: QuantityEqualityOptionsInput): boolean {
	return expectedValue.equals(inputValue, options)
}

export const physicsEqualityAdapters = {
	[PrecisionNumberType]: {
		isValue: (value): value is PrecisionNumber => value instanceof PrecisionNumber,
		isOptions: isPrecisionNumberEqualityOptionsInput,
		areEqual: arePrecisionNumbersEqual,
	} satisfies ValueEqualityAdapter<PrecisionNumber, PrecisionNumberEqualityOptionsInput>,
	[UnitType]: {
		isValue: (value): value is Unit => value instanceof Unit,
		isOptions: isUnitEqualityOptionsInput,
		areEqual: areUnitsEqual,
	} satisfies ValueEqualityAdapter<Unit, UnitEqualityOptionsInput>,
	[QuantityType]: {
		isValue: (value): value is Quantity => value instanceof Quantity,
		isOptions: isQuantityEqualityOptionsInput,
		areEqual: areQuantitiesEqual,
	} satisfies ValueEqualityAdapter<Quantity, QuantityEqualityOptionsInput>,
}
