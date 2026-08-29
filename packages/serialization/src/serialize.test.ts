import { describe, expect, it } from 'vitest'

import { PrecisionNumber } from '@step-wise/physics-core'

import { serializeData, serializeDomainObject } from './serialize.ts'

describe('serializeDomainObject', () => {
	it('serializes a registered domain object', () => {
		expect(serializeDomainObject(new PrecisionNumber('3.140'))).toEqual({
			type: 'PrecisionNumber',
			value: { number: 3.14, significantDigits: 4, power: 0 },
		})
	})

	it('rejects domain objects that do not match their registered type', () => {
		class FakePrecisionNumber { readonly type = 'PrecisionNumber' }
		expect(() => serializeDomainObject(new FakePrecisionNumber())).toThrow(/does not match type/)
	})

	it('rejects invalid domain objects', () => {
		class MissingType {}
		class NonStringType { readonly type = 3 }
		class UnknownType { readonly type = 'Unknown' }

		expect(() => serializeDomainObject({ type: 'PrecisionNumber' } as never)).toThrow(/non-plain/)
		expect(() => serializeDomainObject(new MissingType() as never)).toThrow(/string type/)
		expect(() => serializeDomainObject(new NonStringType() as never)).toThrow(/string type/)
		expect(() => serializeDomainObject(new UnknownType())).toThrow(/unknown type/)
	})
})

describe('serializeData', () => {
	it('preserves JSON-safe primitives and recursively serializes data', () => {
		const data = {
			array: ['text', true, 3, null, new PrecisionNumber('2.50')],
			nested: { value: false },
		}

		expect(serializeData(data)).toEqual({
			array: ['text', true, 3, null, { type: 'PrecisionNumber', value: { number: 2.5, significantDigits: 3, power: 0 } }],
			nested: { value: false },
		})
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
		expect(() => serializeData(value)).toThrow()
	})

	it('rejects sparse arrays', () => {
		expect(() => serializeData(new Array(1))).toThrow(/sparse/)
	})

	it('rejects circular data while allowing repeated references', () => {
		const circular: { self?: unknown } = {}
		circular.self = circular
		expect(() => serializeData(circular)).toThrow(/circular/)

		const shared = { value: 1 }
		expect(serializeData({ first: shared, second: shared })).toEqual({ first: { value: 1 }, second: { value: 1 } })
	})

	it('rejects non-plain objects with unknown types', () => {
		class UnknownDomainObject { readonly type = 'Unknown' }

		expect(() => serializeData(new UnknownDomainObject())).toThrow(/unknown type/)
	})
})
