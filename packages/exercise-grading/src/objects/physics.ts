import { type FloatEqualityOptionsInput, Float, FloatType } from '@step-wise/physics-core'
import { type UnitEqualityOptionsInput, Unit, UnitType } from '@step-wise/physics-core'
import { type FloatUnitEqualityOptionsInput, FloatUnit, FloatUnitType } from '@step-wise/physics-core'

import type { TypeCompareFunction } from '../types'

export function compareFloat(inputValue: unknown, expectedValue: unknown, options: FloatEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Float) || !(inputValue instanceof Float)) throw new Error(`Invalid Float comparison: received parameters that were not Floats.`)
	return expectedValue.equals(inputValue, options)
}

export function compareUnit(inputValue: unknown, expectedValue: unknown, options: UnitEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof Unit) || !(inputValue instanceof Unit)) throw new Error(`Invalid Unit comparison: received parameters that were not Units.`)
	return expectedValue.equals(inputValue, options)
}

export function compareFloatUnit(inputValue: unknown, expectedValue: unknown, options: FloatUnitEqualityOptionsInput): boolean {
	if (!(expectedValue instanceof FloatUnit) || !(inputValue instanceof FloatUnit)) throw new Error(`Invalid FloatUnit comparison: received parameters that were not FloatUnits.`)
	return expectedValue.equals(inputValue, options)
}

export const physicsCompareFunctions = {
	[FloatType]: compareFloat,
	[UnitType]: compareUnit,
	[FloatUnitType]: compareFloatUnit,
} satisfies Record<string, TypeCompareFunction>
