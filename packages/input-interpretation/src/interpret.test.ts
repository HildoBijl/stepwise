import { describe, expect, it } from 'vitest'

import { interpretInputData, interpretInputValue } from './interpret'

describe('interpretInputValue', () => {
	it('interprets a registered input value', () => {
		expect(interpretInputValue({ type: 'Integer', value: '42' })).toBe(42)
	})

	it.each([
		['a non-object', 3],
		['an object without a type', { value: '3' }],
		['an object with a non-string type', { type: 3, value: '3' }],
		['an object without a value', { type: 'Integer' }],
	])('rejects %s', (_description, value) => {
		expect(() => interpretInputValue(value as never)).toThrow(/type and value/)
	})

	it('rejects unknown and inherited type names', () => {
		expect(() => interpretInputValue({ type: 'Unknown', value: 3 })).toThrow(/unknown type/)
		expect(() => interpretInputValue({ type: 'toString', value: 3 })).toThrow(/unknown type/)
	})

	it('rejects invalid nested structures', () => {
		expect(() => interpretInputValue({ type: 'MultipleChoice', value: new Array(1) })).toThrow(/sparse/)

		const circular: unknown[] = []
		circular.push(circular)
		expect(() => interpretInputValue({ type: 'MultipleChoice', value: circular })).toThrow(/circular/)
	})
})

describe('interpretInputData', () => {
	it('preserves basic values and recursively interprets input values', () => {
		const data = {
			values: [{ type: 'Integer', value: '3' }, { type: 'MultipleChoice', value: [2, 4] }],
			nested: { text: 'answer', enabled: true, empty: null, missing: undefined },
		}

		expect(interpretInputData(data)).toEqual({
			values: [3, [2, 4]],
			nested: { text: 'answer', enabled: true, empty: null, missing: undefined },
		})
	})

	it('leaves unknown type objects intact while interpreting their contents', () => {
		expect(interpretInputData({
			type: 'Unknown',
			value: 3,
			nested: { input: { type: 'Integer', value: '2' } },
		})).toEqual({ type: 'Unknown', value: 3, nested: { input: 2 } })
	})

	it('commits to recognized input types', () => {
		expect(() => interpretInputData({ type: 'Integer' })).toThrow(/type and value/)
	})

	it.each([
		['a function', () => undefined],
		['a symbol', Symbol('value')],
		['a bigint', 1n],
		['a class instance', new Date()],
	])('rejects %s', (_description, value) => {
		expect(() => interpretInputData(value)).toThrow()
	})

	it('rejects sparse and circular data while allowing repeated references', () => {
		expect(() => interpretInputData(new Array(1))).toThrow(/sparse/)

		const circular: { self?: unknown } = {}
		circular.self = circular
		expect(() => interpretInputData(circular)).toThrow(/circular/)

		const shared = { value: 1 }
		expect(interpretInputData({ first: shared, second: shared })).toEqual({ first: { value: 1 }, second: { value: 1 } })
	})
})
