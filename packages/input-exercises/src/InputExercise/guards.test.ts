import { describe, expect, expectTypeOf, it } from 'vitest'

import { hasInputExerciseProperties, isInputExerciseAction } from './guards.ts'
import type { InputExerciseAction } from './types.ts'

const inputExerciseProperties = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({ state: {} }),
	processGroupActions: () => ({ state: {} }),
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

describe('isInputExerciseAction', () => {
	it('recognizes input and give-up actions and narrows their type', () => {
		const inputAction: unknown = { type: 'input', input: { answer: { type: 'Integer', value: '4' } }, adoptUserHistory: 'user-1' }
		const giveUpAction: unknown = { type: 'giveUp' }

		expect(isInputExerciseAction(inputAction)).toBe(true)
		expect(isInputExerciseAction(giveUpAction)).toBe(true)
		if (isInputExerciseAction(inputAction)) expectTypeOf(inputAction).toEqualTypeOf<InputExerciseAction>()
	})

	it.each([
		undefined,
		{},
		{ type: 'giveUp', extra: true },
		{ type: 'input' },
		{ type: 'input', input: { answer: 4 } },
		{ type: 'input', input: {}, adoptUserHistory: 4 },
		{ type: 'other' },
	])('rejects invalid action %#', action => expect(isInputExerciseAction(action)).toBe(false))
})
