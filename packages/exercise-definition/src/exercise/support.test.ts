import { generateExerciseParameters, getExerciseInitialState } from './support'

describe('generateExerciseParameters', () => {
	test('uses an empty object when no generator is provided', () => {
		expect(generateExerciseParameters(undefined, false)).toEqual({})
	})
})

describe('getExerciseInitialState', () => {
	test('uses an empty object when no initializer is provided', () => {
		expect(getExerciseInitialState(undefined, { value: 2 })).toEqual({})
	})

	test('passes the parameters to the initializer', () => {
		const parameters = { value: 2 }
		const initialState = { remaining: 2 }
		expect(getExerciseInitialState(received => received.value === 2 ? initialState : {}, parameters)).toBe(initialState)
	})

	test.each([undefined, null, [], 3])('rejects a non-plain initial state: %p', initialState => {
		expect(() => getExerciseInitialState(() => initialState as never, {})).toThrow(TypeError)
	})
})
