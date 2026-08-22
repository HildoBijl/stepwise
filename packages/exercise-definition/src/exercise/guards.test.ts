import { describe, expect, it } from 'vitest'

import { exerciseModes, exerciseReducerNameByMode } from '../modes'

import { isExercise, isExerciseSpec } from './guards'

const generateParameters = () => ({})
const getInitialState = () => ({})
const processSoloAction = () => ({})
const processGroupActions = () => ({})

describe('isExerciseSpec', () => {
	it('accepts a minimal exercise specification', () => {
		expect(isExerciseSpec({ metaData: {} })).toBe(true)
	})

	it('accepts an exercise specification with both factories', () => {
		expect(isExerciseSpec({ metaData: {}, generateParameters, getInitialState })).toBe(true)
	})

	it.each([undefined, null, [], 3, 'exercise', () => ({})])('rejects a non-object specification: %p', value => {
		expect(isExerciseSpec(value)).toBe(false)
	})

	it.each([undefined, null, [], 3])('rejects invalid metadata: %p', metaData => {
		expect(isExerciseSpec({ metaData })).toBe(false)
	})

	it.each(['generateParameters', 'getInitialState'] as const)('rejects a non-function %s property', property => {
		expect(isExerciseSpec({ metaData: {}, [property]: {} })).toBe(false)
	})
})

describe('isExercise', () => {
	const baseExercise = { metaData: {}, generateParameters, getInitialState }

	it('accepts a solo exercise', () => {
		expect(isExercise({ ...baseExercise, processSoloAction })).toBe(true)
	})

	it('accepts a group exercise', () => {
		expect(isExercise({ ...baseExercise, processGroupActions })).toBe(true)
	})

	it('accepts an exercise supporting both modes', () => {
		expect(isExercise({ ...baseExercise, processSoloAction, processGroupActions })).toBe(true)
	})

	it('rejects an exercise without a reducer', () => {
		expect(isExercise(baseExercise)).toBe(false)
	})

	it.each(['generateParameters', 'getInitialState'] as const)('requires %s to be resolved to a function', property => {
		expect(isExercise({ ...baseExercise, [property]: undefined, processSoloAction })).toBe(false)
	})

	it.each(['processSoloAction', 'processGroupActions'] as const)('rejects a non-function %s reducer', reducerName => {
		expect(isExercise({ ...baseExercise, [reducerName]: {} })).toBe(false)
	})

	it('defines a reducer name for every registered mode', () => {
		expect(Object.keys(exerciseReducerNameByMode).sort()).toEqual([...exerciseModes].sort())
	})
})
