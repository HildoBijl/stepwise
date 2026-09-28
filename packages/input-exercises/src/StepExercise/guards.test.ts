import { describe, expect, expectTypeOf, it } from 'vitest'

import { isStepExercise, isStepExerciseHistory, isStepExerciseState } from './guards.ts'
import type { StepExerciseHistory, StepExerciseState } from './types.ts'

const exercise = {
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({ state: {} }),
	processGroupActions: () => ({ state: {} }),
	checkInput: () => true,
	valueOperations: { serialize: (value: unknown) => value as never, deserialize: (value: unknown) => value, interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
}

describe('isStepExercise', () => {
	it('recognizes step exercises with step metadata', () => {
		expect(isStepExercise({ ...exercise, type: 'step', metadata: { steps: [] } })).toBe(true)
		expect(isStepExercise({ ...exercise, type: 'step', metadata: {} })).toBe(false)
		expect(isStepExercise({ ...exercise, type: 'mono', metadata: {} })).toBe(false)
	})
})

describe('isStepExerciseState', () => {
	it('recognizes unsplit and split step-exercise states and narrows their type', () => {
		const unsplitState: unknown = { attempted: true }
		const splitState: unknown = {
			split: true,
			step: 2,
			attemptedBy: ['user-1'],
			1: { attempted: true, solved: true, done: true },
			2: { 1: true },
		}

		expect(isStepExerciseState(unsplitState)).toBe(true)
		expect(isStepExerciseState(splitState)).toBe(true)
		if (isStepExerciseState(splitState)) expectTypeOf(splitState).toEqualTypeOf<StepExerciseState>()
	})

	it.each([
		undefined,
		[],
		{ attempted: false },
		{ solved: true, givenUp: true },
		{ split: false, step: 1 },
		{ split: true, step: -1 },
		{ split: true, step: 1.5 },
		{ split: true, step: 1, 0: {} },
		{ split: true, step: 1, 1: { split: true } },
		{ split: true, step: 1, 1: { 1: false } },
	])('rejects invalid state %#', state => expect(isStepExerciseState(state)).toBe(false))
})

describe('isStepExerciseHistory', () => {
	const inputAction = { type: 'input', input: { answer: { type: 'Integer', value: '4' } } }

	it('recognizes solo and group histories and narrows their type', () => {
		const soloHistory: unknown = [{ action: inputAction, state: { split: true, step: 1, 1: {} } }]
		const groupHistory: unknown = [
			{ actions: [{ userId: 'user-1', action: inputAction }] },
			{ actions: [{ userId: 'user-1', action: { type: 'giveUp' } }], state: { split: true, step: 1, 1: { givenUp: true, done: true } } },
		]

		expect(isStepExerciseHistory(soloHistory)).toBe(true)
		expect(isStepExerciseHistory(groupHistory)).toBe(true)
		if (isStepExerciseHistory(soloHistory)) expectTypeOf(soloHistory).toEqualTypeOf<StepExerciseHistory>()
	})

	it.each([
		undefined,
		{},
		[{ action: { type: 'other' }, state: {} }],
		[{ action: inputAction, state: { split: true, step: 1, 1: { done: false } } }],
		[{ actions: [{ userId: 1, action: inputAction }] }],
		[{ actions: [], report: {} }],
		[{ action: inputAction, state: {} }, { actions: [] }],
	])('rejects invalid history %#', history => expect(isStepExerciseHistory(history)).toBe(false))
})
