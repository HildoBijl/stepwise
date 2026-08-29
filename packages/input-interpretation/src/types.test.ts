import { describe, expect, it } from 'vitest'

import { isInputValueAdapter } from './types.ts'

describe('isInputValueAdapter', () => {
	const adapter = { isInputValue: () => true, isDomainValue: () => true, interpret: () => 1, toInputValue: () => ({ type: 'Test', value: 1 }) }

	it('accepts complete adapters', () => expect(isInputValueAdapter(adapter)).toBe(true))
	it('rejects missing, extra, and non-function members', () => {
		expect(isInputValueAdapter({ ...adapter, interpret: undefined })).toBe(false)
		expect(isInputValueAdapter({ ...adapter, extra: true })).toBe(false)
		expect(isInputValueAdapter(null)).toBe(false)
	})
})
