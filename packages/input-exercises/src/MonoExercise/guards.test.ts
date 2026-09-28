import { describe, expect, expectTypeOf, it } from 'vitest'

import { isMonoExercise, isMonoExerciseHistory, isMonoExerciseState } from './guards.ts'
import type { MonoExerciseHistory, MonoExerciseState } from './types.ts'

const exercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({ state: {} }),
	processGroupActions: () => ({ state: {} }),
	checkInput: () => true,
	valueOperations: { serialize: (value: unknown) => value as never, deserialize: (value: unknown) => value, interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
}

describe('isMonoExercise', () => {
	it('recognizes mono exercises by their discriminator', () => {
		expect(isMonoExercise({ ...exercise, type: 'mono' })).toBe(true)
		expect(isMonoExercise({ ...exercise, type: 'step', metadata: { steps: [] } })).toBe(false)
	})
})

describe('isMonoExerciseState', () => {
	it('recognizes mono-exercise states and narrows their type', () => {
		const state: unknown = { attempted: true, inputDependency: { type: 'Integer', value: 4 }, solved: true, done: true }
		expect(isMonoExerciseState(state)).toBe(true)
		if (isMonoExerciseState(state)) expectTypeOf(state).toEqualTypeOf<MonoExerciseState>()
	})

	it.each([
		undefined,
		[],
		{ attempted: false },
		{ attemptedBy: [1] },
		{ inputDependency: undefined, extra: true },
		{ inputDependencies: { user: undefined } },
		{ solved: false },
		{ done: 'true' },
	])('rejects invalid state %#', state => expect(isMonoExerciseState(state)).toBe(false))
})

describe('isMonoExerciseHistory', () => {
	const inputAction = { type: 'input', input: { answer: { type: 'Integer', value: '4' } } }

	it('recognizes solo and group histories and narrows their type', () => {
		const soloHistory: unknown = [{ action: inputAction, state: { attempted: true }, report: { correct: true } }]
		const groupHistory: unknown = [
			{ actions: [{ userId: 'user-1', action: inputAction }] },
			{ actions: [{ userId: 'user-1', action: { type: 'giveUp' } }], state: { done: true }, report: { 'user-1': { correct: false } } },
		]

		expect(isMonoExerciseHistory(soloHistory)).toBe(true)
		expect(isMonoExerciseHistory(groupHistory)).toBe(true)
		if (isMonoExerciseHistory(soloHistory)) expectTypeOf(soloHistory).toEqualTypeOf<MonoExerciseHistory>()
	})

	it.each([
		undefined,
		{},
		[{ action: { type: 'other' }, state: {} }],
		[{ action: inputAction, state: { step: 1 } }],
		[{ actions: [{ userId: 1, action: inputAction }] }],
		[{ actions: [], report: {} }],
		[{ actions: [], state: {}, report: { 'user-1': false } }],
		[{ action: inputAction, state: {} }, { actions: [] }],
	])('rejects invalid history %#', history => expect(isMonoExerciseHistory(history)).toBe(false))
})
