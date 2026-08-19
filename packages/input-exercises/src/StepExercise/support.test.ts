import { getLastInputAtStep } from './support'

describe('getLastInputAtStep', () => {
	test('skips a pending event when resolved input is required', () => {
		const userId = 'user-1'
		const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
		const history = { mode: 'group', events: [
			{ progress: { split: true, step: 1, 1: {} }, submissions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
			{ submissions: [{ userId, action: { type: 'input', input: { answer: { type: 'Text', value: 'pending' } } } }] },
		] } as const

		expect(getLastInputAtStep(history, 0, userId, true)).toBe(resolvedInput)
	})
})
