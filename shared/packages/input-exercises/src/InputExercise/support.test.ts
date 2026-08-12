import { getLastInput } from './support'

describe('getLastInput', () => {
	const userId = 'user-1'
	const resolvedInput = { answer: 'resolved' }
	const pendingInput = { answer: 'pending' }

	const history = [
		{ progress: {}, submissions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
		{ progress: null, submissions: [{ userId, action: { type: 'input', input: pendingInput } }] },
	]

	test('returns a pending group input when resolved input is not required', () => {
		expect(getLastInput(history as any, userId)).toBe(pendingInput)
	})

	test('skips a GraphQL-shaped pending event when resolved input is required', () => {
		expect(getLastInput(history as any, userId, true)).toBe(resolvedInput)
	})
})
