import { ensureExerciseAction, isExerciseAction } from './atomTypes.ts'

describe('exercise action validation', () => {
	it('accepts plain data objects with a string type', () => {
		const action = { type: 'submit', input: { answer: 42 } }
		expect(isExerciseAction(action)).toBe(true)
		expect(ensureExerciseAction(action)).toBe(action)
	})

	it.each([
		null,
		{},
		{ type: 3 },
		{ type: 'submit', callback: () => undefined },
	])('rejects invalid action %#', action => {
		expect(isExerciseAction(action)).toBe(false)
		expect(() => ensureExerciseAction(action)).toThrow(TypeError)
	})
})
