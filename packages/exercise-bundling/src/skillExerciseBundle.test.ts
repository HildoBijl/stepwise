import { describe, expect, expectTypeOf, it } from 'vitest'

import { type Exercise } from '@step-wise/exercise-definition'

import { withSameExamples } from './skillExerciseBundle'

const exercise = {
	metadata: {},
	generateParameters: () => ({}),
	getInitialState: () => ({}),
	processSoloAction: () => ({}),
} satisfies Exercise

describe('withSameExamples', () => {
	it('uses the supplied collection for exercises and examples', () => {
		const exercises = { exercise }

		expect(withSameExamples(exercises)).toEqual({ exercises, examples: exercises })
	})

	it('preserves the shared collection reference', () => {
		const exercises = { exercise }
		const bundle = withSameExamples(exercises)

		expect(bundle.exercises).toBe(exercises)
		expect(bundle.examples).toBe(exercises)
	})

	it('does not modify the supplied collection', () => {
		const exercises = { exercise }
		const entries = Object.entries(exercises)

		withSameExamples(exercises)

		expect(Object.entries(exercises)).toEqual(entries)
	})

	it('works with an empty collection', () => {
		const exercises = {}
		expect(withSameExamples(exercises)).toEqual({ exercises: {}, examples: {} })
	})

	it('preserves concrete collection and exercise types', () => {
		const exercises = { exercise }
		const bundle = withSameExamples(exercises)

		expectTypeOf(bundle.exercises).toEqualTypeOf<typeof exercises>()
		expectTypeOf(bundle.examples.exercise).toEqualTypeOf<typeof exercise>()
	})
})
