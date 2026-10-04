import { describe, expect, expectTypeOf, it } from 'vitest'

import { isInputValue, isInputValueMap } from './support.ts'
import { isInputValueAdapter } from './types.ts'

describe('input values', () => {
	it('recognizes generic input values and input-value maps', () => {
		const value: unknown = { type: 'Integer', value: '4' }
		const map: unknown = { answer: value }

		expect(isInputValue(value)).toBe(true)
		expect(isInputValueMap(map)).toBe(true)
		if (isInputValue(value)) expectTypeOf(value).toMatchTypeOf<{ type: string }>()
		if (isInputValueMap(map)) expectTypeOf(map).toMatchTypeOf<Record<string, unknown>>()
	})

	it.each([
		undefined,
		{ type: 'Integer' },
		{ type: 1, value: '4' },
		{ type: 'Integer', value: undefined },
		{ type: 'Integer', value: '4', extra: true },
	])('rejects invalid input value %#', value => expect(isInputValue(value)).toBe(false))

	it.each([undefined, [], { answer: 4 }, { answer: { type: 'Integer', value: '4', extra: true } }])('rejects invalid input-value map %#', value => expect(isInputValueMap(value)).toBe(false))
})

describe('isInputValueAdapter', () => {
	const adapter = { isInputValue: () => true, isDomainValue: () => true, interpret: () => 1, toInputValue: () => ({ type: 'Test', value: 1 }) }

	it('accepts complete adapters', () => expect(isInputValueAdapter(adapter)).toBe(true))
	it('rejects missing, extra, and non-function members', () => {
		expect(isInputValueAdapter({ ...adapter, interpret: undefined })).toBe(false)
		expect(isInputValueAdapter({ ...adapter, extra: true })).toBe(false)
		expect(isInputValueAdapter(null)).toBe(false)
	})
})
