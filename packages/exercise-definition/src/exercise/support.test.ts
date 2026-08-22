import { resolveExerciseParameters, resolveInitialState } from './support'

describe('resolveExerciseParameters', () => {
	test('uses an empty object when no generator is provided', () => {
		expect(resolveExerciseParameters(undefined, false)).toEqual({})
	})
})

describe('resolveInitialState', () => {
	test('uses an empty object when no initializer is provided', () => {
		expect(resolveInitialState(undefined, { value: 2 })).toEqual({})
	})

	test('passes the parameters to the initializer', () => {
		const parameters = { value: 2 }
		const initialState = { remaining: 2 }
		expect(resolveInitialState(received => received.value === 2 ? initialState : {}, parameters)).toBe(initialState)
	})

	test.each([undefined, null, [], 3])('rejects a non-plain initial state: %p', initialState => {
		expect(() => resolveInitialState(() => initialState as never, {})).toThrow(TypeError)
	})
})
