import { describe, expect, it } from 'vitest'

import { type ValueTypes, combineValueTypes, fundamentalValueTypes } from '@step-wise/value-types'
import { isInputExercise } from '@step-wise/input-exercises'

import { freeBodyDiagramValueTypes, freeBodyDiagramWithPhysicsValueTypes, vectorWithPhysicsValueTypes } from '#mechanicsValueTypes/index'
import { exercises } from '../../index.ts'
describe('mechanics exercise value types', () => {
	it('selects the smallest suitable registry for every current exercise', () => {
		const mechanicsExercises = collectExercises(exercises)
		const freeBodyDiagramExercises = mechanicsExercises.filter(exercise => matchesResolvedRegistry(exercise.valueTypes, freeBodyDiagramValueTypes))
		const freeBodyDiagramPhysicsExercises = mechanicsExercises.filter(exercise => matchesResolvedRegistry(exercise.valueTypes, freeBodyDiagramWithPhysicsValueTypes))
		const vectorPhysicsExercises = mechanicsExercises.filter(exercise => matchesResolvedRegistry(exercise.valueTypes, vectorWithPhysicsValueTypes))

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

function matchesResolvedRegistry(valueTypes: ValueTypes | undefined, customValueTypes: ValueTypes): boolean {
	if (valueTypes === undefined) return false
	const expected = combineValueTypes(fundamentalValueTypes, customValueTypes)
	return Object.keys(valueTypes).length === Object.keys(expected).length && Object.entries(expected).every(([type, valueType]) => valueTypes[type] === valueType)
}
