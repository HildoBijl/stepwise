import { describe, expect, expectTypeOf, it } from 'vitest'

import { interpretInputData, interpretInputValue } from './interpret.ts'
import { TestNumberType, testInputValueAdapters } from './testUtils.ts'

describe('interpretInputValue', () => {
	it('interprets a registered input value', () => {
		expect(interpretInputValue({ type: TestNumberType, value: '42' }, testInputValueAdapters)).toBe(42)
	})

	it.each([
		['a non-object', 3],
		['an object without a type', { value: '3' }],
		['an object with a non-string type', { type: 3, value: '3' }],
		['an object without a value', { type: TestNumberType }],
	])('rejects %s', (_description, value) => {
		expect(() => interpretInputValue(value, testInputValueAdapters)).toThrow(/type and value/)
	})

	it('rejects values that do not match their registered input type', () => {
		expect(() => interpretInputValue({ type: TestNumberType, value: 3 }, testInputValueAdapters)).toThrow(/does not match type/)
		expect(() => interpretInputValue({ type: TestNumberType, value: '3', extra: true }, testInputValueAdapters)).toThrow(/does not match type/)
	})

	it('rejects unknown and inherited type names', () => {
		expect(() => interpretInputValue({ type: 'Unknown', value: 3 }, testInputValueAdapters)).toThrow(/unknown type/)
		expect(() => interpretInputValue({ type: 'toString', value: 3 }, testInputValueAdapters)).toThrow(/unknown type/)
	})

	it('rejects invalid nested structures', () => {
		expect(() => interpretInputValue({ type: TestNumberType, value: new Array(1) }, testInputValueAdapters)).toThrow(/sparse/)

		const circular: unknown[] = []
		circular.push(circular)
		expect(() => interpretInputValue({ type: TestNumberType, value: circular }, testInputValueAdapters)).toThrow(/circular/)
	})
})

describe('interpretInputData', () => {
	it('preserves an object root in its return type', () => {
		const result = interpretInputData({ answer: { type: TestNumberType, value: '3' } }, testInputValueAdapters)
		expectTypeOf(result).toEqualTypeOf<Record<string, unknown>>()
	})

	it('preserves basic values and recursively interprets input values', () => {
		const data = {
			values: [{ type: TestNumberType, value: '3' }, { type: TestNumberType, value: '4' }],
			nested: { text: 'answer', enabled: true, empty: null },
		}

		expect(interpretInputData(data, testInputValueAdapters)).toEqual({
			values: [3, 4],
			nested: { text: 'answer', enabled: true, empty: null },
		})
	})

	it('leaves unknown type objects intact while interpreting their contents', () => {
		expect(interpretInputData({
			type: 'Unknown',
			value: 3,
			nested: { input: { type: TestNumberType, value: '2' } },
		}, testInputValueAdapters)).toEqual({ type: 'Unknown', value: 3, nested: { input: 2 } })
	})

	it('commits to recognized input types', () => {
		expect(() => interpretInputData({ type: TestNumberType }, testInputValueAdapters)).toThrow(/type and value/)
	})

	it.each([
		['a function', () => undefined],
		['a symbol', Symbol('value')],
		['a bigint', 1n],
		['a class instance', new Date()],
	])('rejects %s', (_description, value) => {
		expect(() => interpretInputData(value, testInputValueAdapters)).toThrow()
	})

	it('rejects sparse and circular data while allowing repeated references', () => {
		expect(() => interpretInputData(new Array(1), testInputValueAdapters)).toThrow(/sparse/)

		const circular: { self?: unknown } = {}
		circular.self = circular
		expect(() => interpretInputData(circular, testInputValueAdapters)).toThrow(/circular/)

		const shared = { value: 1 }
		expect(interpretInputData({ first: shared, second: shared }, testInputValueAdapters)).toEqual({ first: { value: 1 }, second: { value: 1 } })
	})
})
