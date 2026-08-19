import { getLastProgress, getPreviousProgress } from './support'

describe('exercise history progress', () => {
	test('uses the default progress when a group history only has a pending event', () => {
		const history = { mode: 'group', events: [{ submissions: [] }] } as const

		expect(getLastProgress(history)).toEqual({})
		expect(getPreviousProgress(history)).toEqual({})
	})

	test('skips a pending group event when finding progress', () => {
		const firstProgress = { split: true, step: 1 }
		const secondProgress = { split: true, step: 2 }
		const history = { mode: 'group', events: [
			{ submissions: [], progress: firstProgress },
			{ submissions: [], progress: secondProgress },
			{ submissions: [] },
		] } as const

		expect(getLastProgress(history)).toBe(secondProgress)
		expect(getPreviousProgress(history)).toBe(firstProgress)
	})
})
