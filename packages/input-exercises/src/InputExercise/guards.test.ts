import { describe, expect, it } from 'vitest'

import { hasInputExerciseProperties } from './guards.ts'

const inputExerciseProperties = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
	processGroupActions: () => ({}),
	checkInput: () => true,
	valueOperations: { serialize: (value: unknown) => value, deserialize: (value: unknown) => value, interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
}

describe('hasInputExerciseProperties', () => {
	it('recognizes exercises without a solution and with ordinary or input-dependent solutions', () => {
		expect(hasInputExerciseProperties(inputExerciseProperties)).toBe(true)
		expect(hasInputExerciseProperties({ ...inputExerciseProperties, getSolution: () => ({ answer: 1 }) })).toBe(true)
		expect(hasInputExerciseProperties({ ...inputExerciseProperties, updateInputDependency: () => undefined, getSolution: () => ({ answer: 1 }) })).toBe(true)
	})

	it.each([
		undefined,
		{},
		{ ...inputExerciseProperties, checkInput: undefined },
		{ ...inputExerciseProperties, processSoloAction: undefined },
		{ ...inputExerciseProperties, processGroupActions: undefined },
		{ ...inputExerciseProperties, updateInputDependency: true },
		{ ...inputExerciseProperties, getStaticSolution: true },
		{ ...inputExerciseProperties, getSolution: true },
		{ ...inputExerciseProperties, getStaticSolution: () => ({}) },
		{ ...inputExerciseProperties, updateInputDependency: () => undefined },
		{ ...inputExerciseProperties, valueOperations: undefined },
		{ ...inputExerciseProperties, valueOperations: { ...inputExerciseProperties.valueOperations, serialize: undefined } },
		{ ...inputExerciseProperties, valueOperations: { ...inputExerciseProperties.valueOperations, deserialize: undefined } },
		{ ...inputExerciseProperties, valueOperations: { ...inputExerciseProperties.valueOperations, interpretInput: undefined } },
	])('rejects values missing valid input-exercise properties: %p', value => {
		expect(hasInputExerciseProperties(value)).toBe(false)
	})
})
