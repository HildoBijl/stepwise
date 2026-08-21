import { getLastState, getLastResolvedAction, getPreviousState } from './support'

describe('getLastResolvedAction', () => {
	test('finds the latest resolved action from the requested group user', () => {
		const userAction = { type: 'answer', value: 1 }
		const history = [
			{ submissions: [{ userId: 'user-1', action: userAction }], state: {} },
			{ submissions: [{ userId: 'user-2', action: { type: 'answer', value: 2 } }], state: {} },
		] as const

		expect(getLastResolvedAction({ mode: 'group', parameters: {}, history }, 'user-1')).toBe(userAction)
	})
})

describe('exercise history state', () => {
	test('uses the default state when a group history only has a pending event', () => {
		const history = [{ submissions: [] }] as const

		const instance = { mode: 'group', parameters: {}, history } as const
		expect(getLastState(instance)).toEqual({})
		expect(getPreviousState(instance)).toEqual({})
	})

	test('skips a pending group event when finding state', () => {
		const firstState = { split: true, step: 1 }
		const secondState = { split: true, step: 2 }
		const history = [
			{ submissions: [], state: firstState },
			{ submissions: [], state: secondState },
			{ submissions: [] },
		] as const

		const instance = { mode: 'group', parameters: {}, history } as const
		expect(getLastState(instance)).toBe(secondState)
		expect(getPreviousState(instance)).toBe(firstState)
	})
})
