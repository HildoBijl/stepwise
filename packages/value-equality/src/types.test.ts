import { describe, expect, it } from 'vitest'

import { isValueEqualityAdapter } from './types.ts'

describe('isValueEqualityAdapter', () => {
	const adapter = { isValue: () => true, areEqual: () => true }

	it('accepts adapters with omitted or function-valued option guards', () => {
		expect(isValueEqualityAdapter(adapter)).toBe(true)
		expect(isValueEqualityAdapter({ ...adapter, isOptions: () => true })).toBe(true)
	})

	it('rejects missing, extra, and non-function members', () => {
		expect(isValueEqualityAdapter({ ...adapter, areEqual: undefined })).toBe(false)
		expect(isValueEqualityAdapter({ ...adapter, isOptions: true })).toBe(false)
		expect(isValueEqualityAdapter({ ...adapter, extra: true })).toBe(false)
	})
})
