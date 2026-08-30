import type { ValueTypes } from '@step-wise/value-types'
import { describe, expect, it } from 'vitest'
import { PrecisionNumberType, QuantityType, UnitType, physicsValueTypes, precisionNumberValueType, quantityValueType, unitValueType } from '@step-wise/physics-value-types'
import { isInputExercise } from '@step-wise/input-exercises'

import { exercises } from './index.ts'

describe('physics exercise value types', () => {
	it('provides physics value types to every exercise', () => {
		const physicsExercises = collectExercises(exercises)

		expect(physicsExercises.length).toBeGreaterThan(0)
		for (const exercise of physicsExercises) {
			expect(exercise.valueTypes?.[PrecisionNumberType]).toBe(precisionNumberValueType)
			expect(exercise.valueTypes?.[UnitType]).toBe(unitValueType)
			expect(exercise.valueTypes?.[QuantityType]).toBe(quantityValueType)
		}
	})

	it('reuses the shared registry when no additional value types are supplied', () => {
		for (const exercise of collectExercises(exercises)) expect(exercise.valueTypes).toBe(physicsValueTypes)
	})
})

function collectExercises(value: unknown, exercises: { valueTypes?: ValueTypes }[] = [], seen = new WeakSet<object>()): { valueTypes?: ValueTypes }[] {
	if (isInputExercise(value)) {
		exercises.push(value)
		return exercises
	}
	if (typeof value !== 'object' || value === null || seen.has(value)) return exercises
	seen.add(value)
	for (const child of Object.values(value)) collectExercises(child, exercises, seen)
	return exercises
}
