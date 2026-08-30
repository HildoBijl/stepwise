import { describe, expect, it } from 'vitest'

import { type ValueTypes, IntegerType, MultipleChoiceType, fundamentalValueTypes } from '@step-wise/value-types'
import { PrecisionNumberType, QuantityType, UnitType, precisionNumberValueType, quantityValueType, unitValueType } from '@step-wise/physics-value-types'
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

	it('adds the fundamental value types to the shared physics registry', () => {
		for (const exercise of collectExercises(exercises)) {
			expect(exercise.valueTypes?.[IntegerType]).toBe(fundamentalValueTypes[IntegerType])
			expect(exercise.valueTypes?.[MultipleChoiceType]).toBe(fundamentalValueTypes[MultipleChoiceType])
		}
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
