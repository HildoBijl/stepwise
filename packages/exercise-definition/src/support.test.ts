import { describe, expect, it } from 'vitest'

import { isExerciseDone, isStateDone } from './support'

describe('isStateDone', () => {
	it('returns true when done is true', () => {
		expect(isStateDone({ done: true })).toBe(true)
	})

	it.each([{}, { done: false }, { done: 1 }, { done: 'true' }])('returns false for state %p', state => {
		expect(isStateDone(state as never)).toBe(false)
	})
})

describe('isExerciseDone', () => {
	it('uses the current solo state', () => {
		const incompleteInstance = { mode: 'solo', parameters: {}, initialState: {}, history: [{ action: { type: 'answer' }, state: { done: false } }] } as const
		const completeInstance = { mode: 'solo', parameters: {}, initialState: {}, history: [{ action: { type: 'answer' }, state: { done: true } }] } as const

		expect(isExerciseDone(incompleteInstance)).toBe(false)
		expect(isExerciseDone(completeInstance)).toBe(true)
	})

	it('uses the latest resolved group state and ignores pending events', () => {
		const instance = {
			mode: 'group', parameters: {}, initialState: {},
			history: [
				{ actions: [], state: { done: true } },
				{ actions: [{ userId: 'user-1', action: { type: 'answer' } }] },
			],
		} as const

		expect(isExerciseDone(instance)).toBe(true)
	})

	it('uses the initial state when there is no resolved history', () => {
		const soloInstance = { mode: 'solo', parameters: {}, initialState: { done: true }, history: [] } as const
		const groupInstance = { mode: 'group', parameters: {}, initialState: { done: true }, history: [{ actions: [] }] } as const

		expect(isExerciseDone(soloInstance)).toBe(true)
		expect(isExerciseDone(groupInstance)).toBe(true)
	})
})
