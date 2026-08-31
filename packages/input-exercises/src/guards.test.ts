import { expectTypeOf } from 'vitest'

import type { Exercise } from '@step-wise/exercise-definition'

import { isInputExercise } from './guards.ts'
import type { AnyInputExercise } from './types.ts'

const commonExerciseProperties = {
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
	processGroupActions: () => ({}),
	checkInput: () => true,
	valueOperations: { deserializeParameters: () => ({}), interpretInput: () => ({}), toInputValue: () => ({ type: 'Integer', value: '0' }), areValuesEqual: () => true },
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
			processSoloAction: () => ({}),
		} satisfies Exercise
		expect(isInputExercise(exercise)).toBe(false)
	})
})
