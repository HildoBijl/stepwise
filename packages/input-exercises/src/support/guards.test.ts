import { describe, expect, expectTypeOf, it } from 'vitest'

import type { Exercise } from '@step-wise/exercise-definition'

import { type AnyInputExercise, isInputExercise, isInputExerciseInstance } from './guards.ts'
import type { InputExerciseInstance } from './history.ts'

const commonExerciseProperties = {
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({ state: {} }),
	processGroupActions: () => ({ state: {} }),
	checkInput: () => true,
	valueOperations: { serialize: (value: unknown) => value as never, deserialize: (value: unknown) => value, interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
}

const monoExercise = {
	...commonExerciseProperties,
	type: 'mono',
	metadata: {},
} as const

const stepExercise = {
	...commonExerciseProperties,
	type: 'step',
	metadata: { steps: [] },
} as const

describe('input exercise guards', () => {
	it('recognizes either concrete variant as an input exercise', () => {
		expect(isInputExercise(monoExercise)).toBe(true)
		expect(isInputExercise(stepExercise)).toBe(true)
	})

	it.each([
		undefined,
		{},
		{ ...monoExercise, type: 'other' },
		{ ...monoExercise, checkInput: undefined },
		{ ...monoExercise, processSoloAction: undefined },
		{ ...monoExercise, processGroupActions: undefined },
		{ ...monoExercise, getSolution: {} },
		{ ...stepExercise, metadata: {} },
	])('rejects non-input and malformed exercises: %p', value => {
		expect(isInputExercise(value)).toBe(false)
	})

	it('narrows input exercises to the concrete input-exercise union', () => {
		const exercise: unknown = monoExercise
		if (!isInputExercise(exercise)) throw new Error('Expected an input exercise.')
		expectTypeOf(exercise).toEqualTypeOf<AnyInputExercise>()
	})

	it('rejects a valid general exercise without an input-exercise discriminator', () => {
		const exercise = {
			metadata: {},
			generateParameters: () => ({}),
			getInitialState: () => ({}),
			processSoloAction: () => ({ state: {} }),
		} satisfies Exercise
		expect(isInputExercise(exercise)).toBe(false)
	})
})

describe('isInputExerciseInstance', () => {
	const inputAction = { type: 'input', input: { answer: { type: 'Integer', value: '4' } } }

	it('recognizes enriched solo and group instances and narrows their type', () => {
		const soloInstance: unknown = {
			mode: 'solo', parameters: {}, initialState: {}, history: [
				{ id: 'event-1', eventIndex: 0, action: inputAction, state: {} },
			],
		}
		const groupInstance: unknown = {
			mode: 'group', parameters: {}, initialState: {}, history: [
				{ id: 'event-1', actions: [{ id: 'action-1', userId: 'user-1', action: inputAction }] },
			],
		}

		expect(isInputExerciseInstance(soloInstance)).toBe(true)
		expect(isInputExerciseInstance(groupInstance)).toBe(true)
		if (isInputExerciseInstance(soloInstance)) expectTypeOf(soloInstance).toEqualTypeOf<InputExerciseInstance>()
	})

	it.each([
		undefined,
		{},
		{ mode: 'solo', parameters: {}, initialState: {}, history: [{ action: { type: 'other' }, state: {} }] },
		{ mode: 'solo', parameters: {}, initialState: {}, history: [{ action: inputAction, state: [] }] },
		{ mode: 'group', parameters: {}, initialState: {}, history: [{ actions: [{ userId: 1, action: inputAction }] }] },
		{ mode: 'group', parameters: {}, initialState: {}, history: [{ actions: [], report: {} }] },
		{ mode: 'other', parameters: {}, initialState: {}, history: [] },
		{ mode: 'solo', parameters: [], initialState: {}, history: [] },
		{ mode: 'solo', parameters: {}, initialState: [], history: [] },
	])('rejects invalid instance %#', instance => expect(isInputExerciseInstance(instance)).toBe(false))
})
