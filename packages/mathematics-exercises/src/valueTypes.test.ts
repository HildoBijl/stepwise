import { describe, expect, it } from 'vitest'

import { asEquation, asExpression } from '@step-wise/cas'
import { type AnyInputExercise, isInputExercise } from '@step-wise/input-exercises'
import { EquationType, ExpressionType } from '@step-wise/mathematics-value-types'
import { IntegerType, MultipleChoiceType } from '@step-wise/value-types'

import { exercises } from './index.ts'

describe('mathematics exercise value operations', () => {
	it('provides mathematics and fundamental operations to every exercise', () => {
		const mathematicsExercises = collectExercises(exercises)
		const expression = asExpression('x+1')
		const equation = asEquation('x=1')

		expect(mathematicsExercises.length).toBeGreaterThan(0)
		for (const exercise of mathematicsExercises) {
			const { valueOperations } = exercise
			expect(valueOperations.toInputValue(expression, ExpressionType).type).toBe(ExpressionType)
			expect(valueOperations.toInputValue(equation, EquationType).type).toBe(EquationType)
			expect(valueOperations.areValuesEqual(ExpressionType, expression, expression)).toBe(true)
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
