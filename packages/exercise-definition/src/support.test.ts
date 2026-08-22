import { getCurrentState, getLastResolvedAction, getPreviousState } from './modes'

describe('getLastResolvedAction', () => {
	test('finds the latest resolved action from the requested group user', () => {
		const userAction = { type: 'answer', value: 1 }
		const history = [
			{ submissions: [{ userId: 'user-1', action: userAction }], state: {} },
			{ submissions: [{ userId: 'user-2', action: { type: 'answer', value: 2 } }], state: {} },
		] as const

		expect(getLastResolvedAction({ mode: 'group', parameters: {}, initialState: {}, history }, 'user-1')).toBe(userAction)
	})
})

describe('exercise history state', () => {
	test('uses the initial state when a solo history is empty', () => {
		const initialState = { attempts: 0 }
		const instance = { mode: 'solo', parameters: {}, initialState, history: [] } as const

		expect(getCurrentState(instance)).toBe(initialState)
		expect(getPreviousState(instance)).toBe(initialState)
	})

	test('uses the initial state when a group history only has a pending event', () => {
		const history = [{ submissions: [] }] as const
		const initialState = { attempts: 0 }

		const instance = { mode: 'group', parameters: {}, initialState, history } as const
		expect(getCurrentState(instance)).toBe(initialState)
		expect(getPreviousState(instance)).toBe(initialState)
	})

	test('skips a pending group event when finding state', () => {
		const firstState = { split: true, step: 1 }
		const secondState = { split: true, step: 2 }
		const history = [
			{ submissions: [], state: firstState },
			{ submissions: [], state: secondState },
			{ submissions: [] },
		] as const

		const instance = { mode: 'group', parameters: {}, initialState: { split: false }, history } as const
		expect(getCurrentState(instance)).toBe(secondState)
		expect(getPreviousState(instance)).toBe(firstState)
	})
})
