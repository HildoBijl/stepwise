import { describe, expect, it } from 'vitest'

import { PrecisionNumber } from '@step-wise/physics-core'

import { deserializeData, deserializeDomainObject } from './deserialize.ts'

describe('deserializeDomainObject', () => {
	it('deserializes a registered domain object', () => {
		expect(deserializeDomainObject({ type: 'PrecisionNumber', value: { number: 3.14, significantDigits: 4, power: 0 } })).toEqual(new PrecisionNumber('3.140'))
	})

	it('rejects serialized values that do not match their registered type', () => {
		expect(() => deserializeDomainObject({ type: 'PrecisionNumber', value: {} })).toThrow(/does not match type/)
	})

	it('rejects malformed or unknown serialized domain objects', () => {
		expect(() => deserializeDomainObject(null as never)).toThrow(/type and value/)
		expect(() => deserializeDomainObject({ value: 3 } as never)).toThrow(/type and value/)
		expect(() => deserializeDomainObject({ type: 3, value: 3 } as never)).toThrow(/type and value/)
		expect(() => deserializeDomainObject({ type: 'PrecisionNumber' } as never)).toThrow(/type and value/)
		expect(() => deserializeDomainObject({ type: 'Unknown', value: 3 })).toThrow(/unknown type/)
	})
})

describe('deserializeData', () => {
	it('preserves JSON-safe primitives and recursively deserializes data', () => {
		const data = {
			array: ['text', true, 3, null, { type: 'PrecisionNumber', value: { number: 2.5, significantDigits: 3, power: 0 } }],
			nested: { value: false },
		}

		expect(deserializeData(data)).toEqual({
			array: ['text', true, 3, null, new PrecisionNumber('2.50')],
			nested: { value: false },
		})
	})

	it('leaves unknown type objects as data and processes their contents', () => {
		expect(deserializeData({
			type: 'Unknown',
			value: { type: 'PrecisionNumber', value: { number: 2, significantDigits: 1, power: 0 } },
		})).toEqual({ type: 'Unknown', value: new PrecisionNumber('2') })
	})

	it('commits to recognized domain types', () => {
		expect(() => deserializeData({ type: 'PrecisionNumber' })).toThrow()
	})

	it.each([
		['undefined', undefined],
		['a function', () => undefined],
		['a symbol', Symbol('value')],
		['a bigint', 1n],
		['NaN', Number.NaN],
		['positive infinity', Number.POSITIVE_INFINITY],
		['negative infinity', Number.NEGATIVE_INFINITY],
	])('rejects %s', (_description, value) => {
		expect(() => deserializeData(value)).toThrow()
	})

	it('rejects sparse arrays', () => {
		expect(() => deserializeData(new Array(1))).toThrow(/sparse/)
	})

	it('rejects circular data, including inside recognized domain values', () => {
		const circular: unknown[] = []
		circular.push(circular)

		expect(() => deserializeData(circular)).toThrow(/circular/)
		expect(() => deserializeData({ type: 'PrecisionNumber', value: circular })).toThrow(/circular/)
	})
})
