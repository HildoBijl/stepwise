import { describe, expect, it, vi } from 'vitest'

import { resolveExerciseParameters, resolveInitialState } from './support.ts'

describe('resolveExerciseParameters', () => {
	it('uses an empty object when no generator is provided', async () => {
		await expect(resolveExerciseParameters(undefined, false)).resolves.toEqual({})
	})

	it('passes the example flag to a synchronous generator and returns its result', async () => {
		const parameters = { value: 2 }
		const generateParameters = vi.fn(() => parameters)
		await expect(resolveExerciseParameters(generateParameters, true)).resolves.toBe(parameters)
		expect(generateParameters).toHaveBeenCalledWith(true)
	})

	it('awaits an asynchronous generator', async () => {
		const parameters = { value: 2 }
		await expect(resolveExerciseParameters(async () => parameters, false)).resolves.toBe(parameters)
	})

	it.each([undefined, null, [], 3, 'parameters', new Date()])('rejects non-plain parameters: %p', async parameters => {
		await expect(resolveExerciseParameters(() => parameters as never, false)).rejects.toThrow(TypeError)
	})
})

describe('resolveInitialState', () => {
	it('uses an empty object when no initializer is provided', async () => {
		await expect(resolveInitialState(undefined, { value: 2 })).resolves.toEqual({})
	})

	it('passes the parameters to a synchronous initializer and returns its result', async () => {
		const parameters = { value: 2 }
		const initialState = { remaining: 2 }
		const getInitialState = vi.fn(() => initialState)
		await expect(resolveInitialState(getInitialState, parameters)).resolves.toBe(initialState)
		expect(getInitialState).toHaveBeenCalledWith(parameters)
	})

	it('awaits an asynchronous initializer', async () => {
		const initialState = { remaining: 2 }
		await expect(resolveInitialState(async () => initialState, {})).resolves.toBe(initialState)
	})

	it.each([undefined, null, [], 3, 'state', new Date()])('rejects a non-plain initial state: %p', async initialState => {
		await expect(resolveInitialState(() => initialState as never, {})).rejects.toThrow(TypeError)
	})
})
