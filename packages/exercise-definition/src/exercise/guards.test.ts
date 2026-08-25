import { describe, expect, it } from 'vitest'

import { exerciseSupportsMode, isExercise, isExerciseSpec } from './guards'

const generateParameters = () => ({})
const getInitialState = () => ({})
const processSoloAction = () => ({})
const processGroupActions = () => ({})

describe('isExerciseSpec', () => {
	it('accepts a minimal exercise specification', () => {
		expect(isExerciseSpec({ metadata: {} })).toBe(true)
	})

	it('accepts an exercise specification with both factories', () => {
		expect(isExerciseSpec({ metadata: {}, generateParameters, getInitialState })).toBe(true)
	})

	it.each([undefined, null, [], 3, 'exercise', () => ({})])('rejects a non-object specification: %p', value => {
		expect(isExerciseSpec(value)).toBe(false)
	})

	it.each([undefined, null, [], 3, { weight: -1 }, { repeatAfter: 1.5 }, { setup: 'addition' }])('rejects invalid metadata: %p', metadata => {
		expect(isExerciseSpec({ metadata })).toBe(false)
	})

	it.each(['generateParameters', 'getInitialState'] as const)('rejects a non-function %s property', property => {
		expect(isExerciseSpec({ metadata: {}, [property]: {} })).toBe(false)
	})
})

describe('isExercise', () => {
	const baseExercise = { metadata: {}, generateParameters, getInitialState }

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

})

describe('exerciseSupportsMode', () => {
	const baseExercise = { metadata: {}, generateParameters, getInitialState }
	const soloExercise = { ...baseExercise, processSoloAction }
	const groupExercise = { ...baseExercise, processGroupActions }
	const dualModeExercise = { ...baseExercise, processSoloAction, processGroupActions }

	it('recognizes supported and unsupported modes', () => {
		expect(exerciseSupportsMode(soloExercise, 'solo')).toBe(true)
		expect(exerciseSupportsMode(soloExercise, 'group')).toBe(false)
		expect(exerciseSupportsMode(groupExercise, 'solo')).toBe(false)
		expect(exerciseSupportsMode(groupExercise, 'group')).toBe(true)
	})

	it('recognizes every mode of a multi-mode exercise', () => {
		expect(exerciseSupportsMode(dualModeExercise, 'solo')).toBe(true)
		expect(exerciseSupportsMode(dualModeExercise, 'group')).toBe(true)
	})

	it('rejects an unknown mode at runtime', () => {
		expect(() => exerciseSupportsMode(soloExercise, 'unknown' as never)).toThrow(TypeError)
	})
})
