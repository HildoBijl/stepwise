import { describe, expect, it } from 'vitest'

import { TestNumberType, testInputValueAdapters } from './testUtils.ts'
import { toInputValue } from './toInputValue.ts'

describe('toInputValue', () => {
	it('converts a domain value using the requested input type', () => {
		expect(toInputValue(42, TestNumberType, testInputValueAdapters)).toEqual({ type: TestNumberType, value: '42' })
	})

	it('rejects domain values that do not match the requested type', () => {
		expect(() => toInputValue('42', TestNumberType, testInputValueAdapters)).toThrow(/does not match type/)
	})

	it('rejects missing, unknown, and inherited type names', () => {
		expect(() => toInputValue(3, undefined as never, testInputValueAdapters)).toThrow(/string type/)
		expect(() => toInputValue(3, 'Unknown', testInputValueAdapters)).toThrow(/unknown type/)
		expect(() => toInputValue(3, 'toString', testInputValueAdapters)).toThrow(/unknown type/)
	})
})
