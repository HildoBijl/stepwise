import { describe, expect, it } from 'vitest'

import { isSerializationAdapter } from './types.ts'

describe('isSerializationAdapter', () => {
	const adapter = { isDomainValue: () => true, isSerializedValue: () => true, serialize: () => ({ type: 'Test', value: 1 }), deserialize: () => ({ type: 'Test' }) }

	it('accepts complete adapters', () => expect(isSerializationAdapter(adapter)).toBe(true))
	it('rejects missing, extra, and non-function members', () => {
		expect(isSerializationAdapter({ ...adapter, serialize: undefined })).toBe(false)
		expect(isSerializationAdapter({ ...adapter, extra: true })).toBe(false)
		expect(isSerializationAdapter(null)).toBe(false)
	})
})
