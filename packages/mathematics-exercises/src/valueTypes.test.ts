import type { ValueTypes } from '@step-wise/value-types'
import { describe, expect, it } from 'vitest'
import { ExpressionType, EquationType, expressionValueType, equationValueType, mathematicsValueTypes } from '@step-wise/mathematics-value-types'
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

	it('reuses the shared registry when no additional value types are supplied', () => {
		for (const exercise of collectExercises(exercises)) expect(exercise.valueTypes).toBe(mathematicsValueTypes)
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
