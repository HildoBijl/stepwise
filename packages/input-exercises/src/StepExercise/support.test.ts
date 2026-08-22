import { getLastRawInputAtStep } from './support'

describe('getLastInputAtStep', () => {
	test('skips a pending event when resolved input is required', () => {
		const userId = 'user-1'
		const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
		const history = [
			{ state: { split: true, step: 1, 1: {} }, actions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
			{ actions: [{ userId, action: { type: 'input', input: { answer: { type: 'Text', value: 'pending' } } } }] },
		] as const
		const instance = { mode: 'group', parameters: {}, initialState: {}, history } as const

		expect(getLastRawInputAtStep(instance, 0, userId, true)).toBe(resolvedInput)
	})
})
