import { getLastInput } from './support'

describe('getLastInput', () => {
	const userId = 'user-1'
	const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
	const pendingInput = { answer: { type: 'Text', value: 'pending' } }

	const history = [
		{ state: {}, submissions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
		{ submissions: [{ userId, action: { type: 'input', input: pendingInput } }] },
	] as const

	test('returns a pending group input when resolved input is not required', () => {
		expect(getLastInput('group', history, userId)).toBe(pendingInput)
	})

	test('skips a pending event when resolved input is required', () => {
		expect(getLastInput('group', history, userId, true)).toBe(resolvedInput)
	})
})
