import { getLastProgress, getLastResolvedAction, getPreviousProgress } from './support'

describe('getLastResolvedAction', () => {
	test('finds the latest resolved action from the requested group user', () => {
		const userAction = { type: 'answer', value: 1 }
		const history = { mode: 'group', events: [
			{ submissions: [{ userId: 'user-1', action: userAction }], progress: {} },
			{ submissions: [{ userId: 'user-2', action: { type: 'answer', value: 2 } }], progress: {} },
		] } as const

		expect(getLastResolvedAction(history, 'user-1')).toBe(userAction)
	})
})

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
