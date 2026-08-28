import { describe, expect, it } from 'vitest'

import { getCurrentState, getLastAction, getLastResolvedAction, getPreviousState } from './support.ts'

describe('solo exercise history support', () => {
	const firstAction = { type: 'answer', value: 1 }
	const secondAction = { type: 'answer', value: 2 }
	const initialState = { step: 0 }
	const firstState = { step: 1 }
	const secondState = { step: 2 }

	it('returns the latest action as both the last and last resolved action', () => {
		const instance = {
			mode: 'solo', parameters: {}, initialState,
			history: [{ action: firstAction, state: firstState }, { action: secondAction, state: secondState }],
		} as const

		expect(getLastAction(instance)).toBe(secondAction)
		expect(getLastResolvedAction(instance)).toBe(secondAction)
	})

	it('returns no action for an empty history', () => {
		const instance = { mode: 'solo', parameters: {}, initialState, history: [] } as const

		expect(getLastAction(instance)).toBeUndefined()
		expect(getLastResolvedAction(instance)).toBeUndefined()
	})

	it('returns the current and previous states', () => {
		const instance = {
			mode: 'solo', parameters: {}, initialState,
			history: [{ action: firstAction, state: firstState }, { action: secondAction, state: secondState }],
		} as const

		expect(getCurrentState(instance)).toBe(secondState)
		expect(getPreviousState(instance)).toBe(firstState)
	})

	it('falls back to the initial state when there is insufficient history', () => {
		const emptyInstance = { mode: 'solo', parameters: {}, initialState, history: [] } as const
		const oneEventInstance = { mode: 'solo', parameters: {}, initialState, history: [{ action: firstAction, state: firstState }] } as const

		expect(getCurrentState(emptyInstance)).toBe(initialState)
		expect(getPreviousState(emptyInstance)).toBe(initialState)
		expect(getPreviousState(oneEventInstance)).toBe(initialState)
	})
})

describe('group exercise history support', () => {
	const firstAction = { type: 'answer', value: 1 }
	const secondAction = { type: 'answer', value: 2 }
	const otherAction = { type: 'answer', value: 3 }
	const initialState = { step: 0 }
	const firstState = { step: 1 }
	const secondState = { step: 2 }

	it('includes pending actions when retrieving the last action', () => {
		const instance = {
			mode: 'group', parameters: {}, initialState,
			history: [
				{ actions: [{ userId: 'user-1', action: firstAction }], state: firstState },
				{ actions: [{ userId: 'user-1', action: secondAction }] },
			],
		} as const

		expect(getLastAction(instance, 'user-1')).toBe(secondAction)
		expect(getLastResolvedAction(instance, 'user-1')).toBe(firstAction)
	})

	it('finds the latest action belonging to the requested user', () => {
		const instance = {
			mode: 'group', parameters: {}, initialState,
			history: [
				{ actions: [{ userId: 'user-1', action: firstAction }], state: firstState },
				{ actions: [{ userId: 'user-2', action: otherAction }], state: secondState },
			],
		} as const

		expect(getLastAction(instance, 'user-1')).toBe(firstAction)
		expect(getLastResolvedAction(instance, 'user-1')).toBe(firstAction)
		expect(getLastAction(instance, 'missing-user')).toBeUndefined()
	})

	it('requires a user ID when retrieving an action', () => {
		const instance = { mode: 'group', parameters: {}, initialState, history: [] } as const

		expect(() => getLastAction(instance)).toThrow(TypeError)
		expect(() => getLastResolvedAction(instance)).toThrow(TypeError)
	})

	it('uses resolved events for the current and previous states', () => {
		const instance = {
			mode: 'group', parameters: {}, initialState,
			history: [
				{ actions: [], state: firstState },
				{ actions: [], state: secondState },
				{ actions: [{ userId: 'user-1', action: secondAction }] },
			],
		} as const

		expect(getCurrentState(instance)).toBe(secondState)
		expect(getPreviousState(instance)).toBe(firstState)
	})

	it('falls back to the initial state when there are insufficient resolved events', () => {
		const pendingInstance = { mode: 'group', parameters: {}, initialState, history: [{ actions: [{ userId: 'user-1', action: firstAction }] }] } as const
		const oneResolvedInstance = { mode: 'group', parameters: {}, initialState, history: [{ actions: [], state: firstState }] } as const

		expect(getCurrentState(pendingInstance)).toBe(initialState)
		expect(getPreviousState(pendingInstance)).toBe(initialState)
		expect(getPreviousState(oneResolvedInstance)).toBe(initialState)
	})
})
