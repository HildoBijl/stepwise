import { describe, expect, it } from 'vitest'

import { IntegerType } from './adapters/index.ts'
import { toInputValue } from './toInputValue.ts'

describe('toInputValue', () => {
	it('converts a domain value using the requested input type', () => {
		expect(toInputValue(42, IntegerType)).toEqual({ type: IntegerType, value: '42' })
	})

	it('rejects domain values that do not match the requested type', () => {
		expect(() => toInputValue('42', IntegerType)).toThrow(/does not match type/)
	})

	it('rejects missing, unknown, and inherited type names', () => {
		expect(() => toInputValue(3, undefined as never)).toThrow(/string type/)
		expect(() => toInputValue(3, 'Unknown')).toThrow(/unknown type/)
		expect(() => toInputValue(3, 'toString')).toThrow(/unknown type/)
	})
})