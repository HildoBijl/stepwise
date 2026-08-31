import { describe, expect, it } from 'vitest'

import { isInputExercise } from '@step-wise/input-exercises'

import { exercises } from '../../index.ts'

describe('mechanics exercise value operations', () => {
	it('builds every current exercise with encapsulated value operations', () => {
		const mechanicsExercises = collectExercises(exercises)

		expect(mechanicsExercises).toHaveLength(15)
		mechanicsExercises.forEach(exercise => {
			expect(typeof exercise.valueOperations.deserializeParameters).toBe('function')
			expect(typeof exercise.valueOperations.interpretInput).toBe('function')
			expect(typeof exercise.valueOperations.toInputValue).toBe('function')
			expect(typeof exercise.valueOperations.areValuesEqual).toBe('function')
		})
	})
})

function collectExercises(value: unknown, exercises: ReturnType<typeof getInputExercise>[] = [], seen = new WeakSet<object>()): ReturnType<typeof getInputExercise>[] {
	const exercise = getInputExercise(value)
	if (exercise !== undefined) {
		exercises.push(exercise)
		return exercises
	}
	if (typeof value !== 'object' || value === null || seen.has(value)) return exercises
	seen.add(value)
	for (const child of Object.values(value)) collectExercises(child, exercises, seen)
	return exercises
}

function getInputExercise(value: unknown) {
	return isInputExercise(value) ? value : undefined
}
