import { type FloatEqualityOptionsInput, Float, FloatType } from '@step-wise/physics-core'
import { type UnitEqualityOptionsInput, Unit, UnitType } from '@step-wise/physics-core'
import { type FloatUnitEqualityOptionsInput, FloatUnit, FloatUnitType } from '@step-wise/physics-core'

import type { TypeCompareFunction } from '../types'

export function compareFloat(input: unknown, correct: unknown, options: FloatEqualityOptionsInput): boolean {
	if (!(correct instanceof Float) || !(input instanceof Float)) throw new Error(`Invalid Float comparison: received parameters that were not Floats.`)
	return correct.equals(input, options)
}

export function compareUnit(input: unknown, correct: unknown, options: UnitEqualityOptionsInput): boolean {
	if (!(correct instanceof Unit) || !(input instanceof Unit)) throw new Error(`Invalid Unit comparison: received parameters that were not Units.`)
	return correct.equals(input, options)
}

export function compareFloatUnit(input: unknown, correct: unknown, options: FloatUnitEqualityOptionsInput): boolean {
	if (!(correct instanceof FloatUnit) || !(input instanceof FloatUnit)) throw new Error(`Invalid FloatUnit comparison: received parameters that were not FloatUnits.`)
	return correct.equals(input, options)
}

export const physicsCompareFunctions = {
	[FloatType]: compareFloat,
	[UnitType]: compareUnit,
	[FloatUnitType]: compareFloatUnit,
} satisfies Record<string, TypeCompareFunction>
