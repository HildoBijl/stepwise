import { getLastInputAtStep } from './support'

describe('getLastInputAtStep', () => {
	test('skips a GraphQL-shaped pending event when resolved input is required', () => {
		const userId = 'user-1'
		const resolvedInput = { answer: 'resolved' }
		const history = [
			{ progress: { split: true, step: 1, 1: {} }, submissions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
			{ progress: null, submissions: [{ userId, action: { type: 'input', input: { answer: 'pending' } } }] },
		]

		expect(getLastInputAtStep(history as any, 0, userId, true)).toBe(resolvedInput)
	})
})
