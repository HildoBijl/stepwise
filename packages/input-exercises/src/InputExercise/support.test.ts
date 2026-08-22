import { getLastRawInput } from './support'

describe('getLastInput', () => {
	const userId = 'user-1'
	const resolvedInput = { answer: { type: 'Text', value: 'resolved' } }
	const pendingInput = { answer: { type: 'Text', value: 'pending' } }

	const history = [
		{ state: {}, actions: [{ userId, action: { type: 'input', input: resolvedInput } }] },
		{ actions: [{ userId, action: { type: 'input', input: pendingInput } }] },
	] as const
	const instance = { mode: 'group', parameters: {}, initialState: {}, history } as const

	test('returns a pending group input when resolved input is not required', () => {
		expect(getLastRawInput(instance, userId)).toBe(pendingInput)
	})

	test('skips a pending event when resolved input is required', () => {
		expect(getLastRawInput(instance, userId, true)).toBe(resolvedInput)
	})
})
