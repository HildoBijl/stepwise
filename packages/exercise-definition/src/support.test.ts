import { getLastProgress, getPreviousProgress } from './support'

describe('exercise history progress', () => {
	test('uses the default progress when a group history only has a GraphQL-shaped pending event', () => {
		const history = [{ submissions: [], progress: null }]

		expect(getLastProgress(history as any)).toEqual({})
		expect(getPreviousProgress(history as any)).toEqual({})
	})

	test('skips a GraphQL-shaped pending group event when finding progress', () => {
		const firstProgress = { split: true, step: 1 }
		const secondProgress = { split: true, step: 2 }
		const history = [
			{ submissions: [], progress: firstProgress },
			{ submissions: [], progress: secondProgress },
			{ submissions: [], progress: null },
		]

		expect(getLastProgress(history as any)).toBe(secondProgress)
		expect(getPreviousProgress(history as any)).toBe(firstProgress)
	})
})
