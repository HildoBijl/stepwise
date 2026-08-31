import { describe, expect, it } from 'vitest'

import { type AnyInputExercise, isInputExercise } from '@step-wise/input-exercises'
import { PrecisionNumber, Quantity, Unit } from '@step-wise/physics-core'
import { PrecisionNumberType, QuantityType, UnitType } from '@step-wise/physics-value-types'
import { IntegerType, MultipleChoiceType } from '@step-wise/value-types'

import { exercises } from './index.ts'

describe('physics exercise value operations', () => {
	it('provides physics and fundamental operations to every exercise', () => {
		const physicsExercises = collectExercises(exercises)
		const precisionNumber = new PrecisionNumber('3.14')
		const unit = new Unit('m/s')
		const quantity = new Quantity('2 m')

		expect(physicsExercises.length).toBeGreaterThan(0)
		for (const exercise of physicsExercises) {
			const { valueOperations } = exercise
			expect(valueOperations.toInputValue(precisionNumber, PrecisionNumberType).type).toBe(PrecisionNumberType)
			expect(valueOperations.toInputValue(unit, UnitType).type).toBe(UnitType)
			expect(valueOperations.toInputValue(quantity, QuantityType).type).toBe(QuantityType)
			expect(valueOperations.areValuesEqual(QuantityType, quantity, quantity)).toBe(true)
			expect(valueOperations.interpretInput({ answer: { type: IntegerType, value: '2' } })).toEqual({ answer: 2 })
			expect(valueOperations.toInputValue([1], MultipleChoiceType)).toEqual({ type: MultipleChoiceType, value: [1] })
		}
	})
})

function collectExercises(value: unknown, exercises: AnyInputExercise[] = [], seen = new WeakSet<object>()): AnyInputExercise[] {
	if (isInputExercise(value)) {
		exercises.push(value)
		return exercises
	}
	if (typeof value !== 'object' || value === null || seen.has(value)) return exercises
	seen.add(value)
	for (const child of Object.values(value)) collectExercises(child, exercises, seen)
	return exercises
}
