import { describe, expect, it } from 'vitest'

import { type ValueTypes, IntegerType, MultipleChoiceType, fundamentalValueTypes } from '@step-wise/value-types'
import { ExpressionType, EquationType, expressionValueType, equationValueType } from '@step-wise/mathematics-value-types'
import { isInputExercise } from '@step-wise/input-exercises'

import { exercises } from './index.ts'
describe('mathematics exercise value types', () => {
	it('provides mathematics value types to every exercise', () => {
		const mathematicsExercises = collectExercises(exercises)

		expect(mathematicsExercises.length).toBeGreaterThan(0)
		for (const exercise of mathematicsExercises) {
			expect(exercise.valueTypes?.[ExpressionType]).toBe(expressionValueType)
			expect(exercise.valueTypes?.[EquationType]).toBe(equationValueType)
		}
	})

	it('adds the fundamental value types to the shared mathematics registry', () => {
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
