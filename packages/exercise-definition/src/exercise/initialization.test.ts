import { describe, expect, it, vi } from 'vitest'

import { resolveExerciseParameters, resolveInitialState } from './initialization.ts'

describe('resolveExerciseParameters', () => {
	it('uses an empty object when no generator is provided', async () => {
		await expect(resolveExerciseParameters(undefined, { example: false, context: undefined })).resolves.toEqual({})
	})

	it('passes the example flag and context to a synchronous generator and returns its result', async () => {
		const parameters = { value: 2 }
		const generateParameters = vi.fn(() => parameters)
		const input = { example: true, context: { source: 'test' } }
		await expect(resolveExerciseParameters(generateParameters, input)).resolves.toBe(parameters)
		expect(generateParameters).toHaveBeenCalledWith(input)
	})

	it('awaits an asynchronous generator', async () => {
		const parameters = { value: 2 }
		await expect(resolveExerciseParameters(async () => parameters, { example: false, context: undefined })).resolves.toBe(parameters)
	})

	it.each([undefined, null, [], 3, 'parameters', new Date()])('rejects non-plain parameters: %p', async parameters => {
		await expect(resolveExerciseParameters(() => parameters as never, { example: false, context: undefined })).rejects.toThrow(TypeError)
	})
})

describe('resolveInitialState', () => {
	it('uses an empty object when no initializer is provided', async () => {
		await expect(resolveInitialState(undefined, { parameters: { value: 2 }, context: undefined })).resolves.toEqual({})
	})

	it('passes the parameters and context to a synchronous initializer and returns its result', async () => {
		const parameters = { value: 2 }
		const initialState = { remaining: 2 }
		const getInitialState = vi.fn(() => initialState)
		const input = { parameters, context: { source: 'test' } }
		await expect(resolveInitialState(getInitialState, input)).resolves.toBe(initialState)
		expect(getInitialState).toHaveBeenCalledWith(input)
	})

	it('awaits an asynchronous initializer', async () => {
		const initialState = { remaining: 2 }
		await expect(resolveInitialState(async () => initialState, { parameters: {}, context: undefined })).resolves.toBe(initialState)
	})

	it.each([undefined, null, [], 3, 'state', new Date()])('rejects a non-plain initial state: %p', async initialState => {
		await expect(resolveInitialState(() => initialState as never, { parameters: {}, context: undefined })).rejects.toThrow(TypeError)
	})
})
