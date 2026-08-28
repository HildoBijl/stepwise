import { skill } from '@step-wise/skill-setup'
import { describe, expect, it } from 'vitest'

import type { ExerciseMetadata } from './types.ts'
import { isExerciseMetadata, resolveExerciseMetadata } from './metadata.ts'

describe('resolveExerciseMetadata', () => {
	it('applies defaults while preserving specialized metadata', () => {
		const metadata: ExerciseMetadata & { custom: string } = { custom: 'value' }
		const resolved = resolveExerciseMetadata(metadata)

		expect(resolved).toEqual({ custom: 'value', weight: 1, repeatAfter: 1 })
		expect(metadata).toEqual({ custom: 'value' })
	})

	it('preserves valid explicit values', () => {
		const setup = skill('addition')
		expect(resolveExerciseMetadata({
			skill: 'arithmetic',
			setup,
			setupInferenceOrder: 6,
			weight: 0.5,
			repeatAfter: 3,
		})).toEqual({ skill: 'arithmetic', setup, setupInferenceOrder: 6, weight: 0.5, repeatAfter: 3 })
	})

	it.each([-1, Infinity, NaN, 'heavy'])('rejects the invalid weight %p', weight => {
		expect(() => resolveExerciseMetadata({ weight } as never)).toThrow()
	})

	it.each([-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, 'later'])('rejects the invalid repeatAfter value %p', repeatAfter => {
		expect(() => resolveExerciseMetadata({ repeatAfter } as never)).toThrow()
	})

	it.each([-1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, 'high'])('rejects the invalid setup inference order %p', setupInferenceOrder => {
		expect(() => resolveExerciseMetadata({ setupInferenceOrder } as never)).toThrow()
	})

	it.each(['', ' leading', 'trailing ', '   ', 3])('rejects the invalid skill ID %p', skillId => {
		expect(() => resolveExerciseMetadata({ skill: skillId } as never)).toThrow()
	})

	it.each(['addition', {}, null])('rejects the invalid setup %p', setup => {
		expect(() => resolveExerciseMetadata({ setup } as never)).toThrow(TypeError)
	})

	it.each([undefined, null, [], 3, 'metadata'])('rejects non-plain metadata %p', metadata => {
		expect(() => resolveExerciseMetadata(metadata as never)).toThrow(TypeError)
	})
})

describe('isExerciseMetadata', () => {
	it('accepts valid raw and specialized metadata', () => {
		expect(isExerciseMetadata({})).toBe(true)
		expect(isExerciseMetadata({ weight: 0, custom: true })).toBe(true)
	})

	it.each([
		null,
		[],
		{ weight: -1 },
		{ repeatAfter: 1.5 },
		{ setupInferenceOrder: Infinity },
		{ setup: 'addition' },
	])('rejects invalid metadata %p', metadata => {
		expect(isExerciseMetadata(metadata)).toBe(false)
	})

	it('does not hide unexpected errors', () => {
		const metadata = Object.defineProperty({}, 'skill', {
			get: () => { throw new Error('Unexpected failure') },
		})
		expect(() => isExerciseMetadata(metadata)).toThrow('Unexpected failure')
	})
})
