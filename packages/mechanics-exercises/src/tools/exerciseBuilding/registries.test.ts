import type { ValueTypes } from '@step-wise/value-types'
import { describe, expect, it } from 'vitest'
import { isInputExercise } from '@step-wise/input-exercises'

import { freeBodyDiagramValueTypes, freeBodyDiagramWithPhysicsValueTypes, vectorWithPhysicsValueTypes } from '#mechanicsValueTypes/index'

import { exercises } from '../../index.ts'

describe('mechanics exercise value types', () => {
	it('selects the smallest suitable registry for every current exercise', () => {
		const mechanicsExercises = collectExercises(exercises)
		const freeBodyDiagramExercises = mechanicsExercises.filter(exercise => exercise.valueTypes === freeBodyDiagramValueTypes)
		const freeBodyDiagramPhysicsExercises = mechanicsExercises.filter(exercise => exercise.valueTypes === freeBodyDiagramWithPhysicsValueTypes)
		const vectorPhysicsExercises = mechanicsExercises.filter(exercise => exercise.valueTypes === vectorWithPhysicsValueTypes)

		expect(mechanicsExercises).toHaveLength(15)
		expect(freeBodyDiagramExercises).toHaveLength(5)
		expect(freeBodyDiagramPhysicsExercises).toHaveLength(4)
		expect(vectorPhysicsExercises).toHaveLength(6)
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
