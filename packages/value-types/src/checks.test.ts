import { describe, expect, it } from 'vitest'

import { isValueType, isValueTypes } from './checks.ts'

const inputValue = { isInputValue: () => true, isDomainValue: () => true, interpret: () => 1, toInputValue: () => ({ type: 'Test', value: 1 }) }
const serialization = { isDomainValue: () => true, isSerializedValue: () => true, serialize: () => ({ type: 'Test', value: 1 }), deserialize: () => ({ type: 'Test' }) }
const equality = { isValue: () => true, areEqual: () => true }

describe('value-type checks', () => {
	it('accepts empty, partial, and complete value types', () => {
		expect(isValueType({})).toBe(true)
		expect(isValueType({ serialization })).toBe(true)
		expect(isValueType({ serialization, inputValue, equality })).toBe(true)
		expect(isValueTypes({ Test: { inputValue, equality }, Stored: { serialization } })).toBe(true)
	})

	it('delegates validation of supplied adapter capabilities', () => {
		expect(isValueType({ serialization: { serialize: () => ({}) } })).toBe(false)
		expect(isValueType({ inputValue: { isInputValue: () => true } })).toBe(false)
		expect(isValueType({ equality: { isValue: () => true } })).toBe(false)
		expect(isValueType({ unknown: equality })).toBe(false)
		expect(isValueTypes({ Test: null })).toBe(false)
	})
})
