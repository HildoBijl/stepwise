import { describe, expect, it } from 'vitest'

import { ensureExerciseMode, exerciseModes, exerciseReducerNameByMode, throwUnsupportedExerciseMode } from './modeRegistry.ts'

describe('ensureExerciseMode', () => {
	it.each(exerciseModes)('returns the registered mode "%s"', mode => {
		expect(ensureExerciseMode(mode)).toBe(mode)
	})

	it.each([undefined, null, '', 'individual', 1, {}])('rejects the invalid mode %p', mode => {
		expect(() => ensureExerciseMode(mode)).toThrow(TypeError)
	})
})

describe('exerciseReducerNameByMode', () => {
	it('defines a reducer name for every registered mode', () => {
		expect(Object.keys(exerciseReducerNameByMode).sort()).toEqual([...exerciseModes].sort())
	})
})

describe('throwUnsupportedExerciseMode', () => {
	it('throws for a mode missed by an exhaustive switch', () => {
		expect(() => throwUnsupportedExerciseMode('unknown' as never)).toThrow('Unsupported exercise mode: "unknown".')
	})
})
