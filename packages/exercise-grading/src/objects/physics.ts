import { type PrecisionNumberEqualityOptionsInput, PrecisionNumber, PrecisionNumberType } from '@step-wise/physics-core'
import { type UnitEqualityOptionsInput, Unit, UnitType } from '@step-wise/physics-core'
import { type QuantityEqualityOptionsInput, Quantity, QuantityType } from '@step-wise/physics-core'

import type { TypeCompareFunction } from '../types'

export function comparePrecisionNumber(inputValue: unknown, expectedValue: unknown, options: PrecisionNumberEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof PrecisionNumber) || !(inputValue instanceof PrecisionNumber)) throw new Error(`Invalid PrecisionNumber comparison: received parameters that were not PrecisionNumber instances.`)
	return expectedValue.equals(inputValue, options)
}

export function compareUnit(inputValue: unknown, expectedValue: unknown, options: UnitEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Unit) || !(inputValue instanceof Unit)) throw new Error(`Invalid Unit comparison: received parameters that were not Units.`)
	return expectedValue.equals(inputValue, options)
}

export function compareQuantity(inputValue: unknown, expectedValue: unknown, options: QuantityEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Quantity) || !(inputValue instanceof Quantity)) throw new Error(`Invalid Quantity comparison: received parameters that were not Quantitys.`)
	return expectedValue.equals(inputValue, options)
}

export const physicsCompareFunctions = {
	[PrecisionNumberType]: comparePrecisionNumber,
	[UnitType]: compareUnit,
	[QuantityType]: compareQuantity,
} satisfies Record<string, TypeCompareFunction>
