import { describe, expect, it, vi } from 'vitest'

import { resolveExerciseParameters, resolveInitialState } from './support.ts'

describe('resolveExerciseParameters', () => {
	it('uses an empty object when no generator is provided', () => {
		expect(resolveExerciseParameters(undefined, false)).toEqual({})
	})

	it('passes the example flag to the generator and returns its result', () => {
		const parameters = { value: 2 }
		const generateParameters = vi.fn(() => parameters)

		expect(resolveExerciseParameters(generateParameters, true)).toBe(parameters)
		expect(generateParameters).toHaveBeenCalledWith(true)
	})

	it.each([undefined, null, [], 3, 'parameters', new Date()])('rejects non-plain parameters: %p', parameters => {
		expect(() => resolveExerciseParameters(() => parameters as never, false)).toThrow(TypeError)
	})
})

describe('resolveInitialState', () => {
	it('uses an empty object when no initializer is provided', () => {
		expect(resolveInitialState(undefined, { value: 2 })).toEqual({})
	})

	it('passes the parameters to the initializer and returns its result', () => {
		const parameters = { value: 2 }
		const initialState = { remaining: 2 }
		const getInitialState = vi.fn(() => initialState)

		expect(resolveInitialState(getInitialState, parameters)).toBe(initialState)
		expect(getInitialState).toHaveBeenCalledWith(parameters)
	})

	it.each([undefined, null, [], 3, 'state', new Date()])('rejects a non-plain initial state: %p', initialState => {
		expect(() => resolveInitialState(() => initialState as never, {})).toThrow(TypeError)
	})
})
