import { describe, expect, it } from 'vitest'

import { hasInputExerciseProperties } from './guards.ts'

const inputExerciseProperties = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
	processGroupActions: () => ({}),
	checkInput: () => true,
}

describe('hasInputExerciseProperties', () => {
	it('recognizes the properties shared by input exercises', () => {
		expect(hasInputExerciseProperties(inputExerciseProperties)).toBe(true)
	})

	it('accepts function, static object and dynamic solution definitions', () => {
		expect(hasInputExerciseProperties({ ...inputExerciseProperties, getSolution: () => ({}) })).toBe(true)
		expect(hasInputExerciseProperties({ ...inputExerciseProperties, getSolution: { getStaticSolution: () => ({}) } })).toBe(true)
		expect(hasInputExerciseProperties({ ...inputExerciseProperties, getSolution: { getStaticSolution: () => ({}), dependentFields: ['answer'], getInputDependency: () => undefined, getDynamicSolution: () => ({}) } })).toBe(true)
	})

	it.each([
		undefined,
		{},
		{ ...inputExerciseProperties, checkInput: undefined },
		{ ...inputExerciseProperties, processSoloAction: undefined },
		{ ...inputExerciseProperties, processGroupActions: undefined },
		{ ...inputExerciseProperties, getSolution: {} },
		{ ...inputExerciseProperties, getSolution: { getStaticSolution: () => ({}), dependentFields: ['answer'] } },
		{ ...inputExerciseProperties, getSolution: { getStaticSolution: () => ({}), getInputDependency: () => undefined } },
		{ ...inputExerciseProperties, valueTypes: { Broken: { equality: {} } } },
	])('rejects values missing valid input-exercise properties: %p', value => {
		expect(hasInputExerciseProperties(value)).toBe(false)
	})
})
