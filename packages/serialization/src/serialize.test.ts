import { describe, expect, it } from 'vitest'

import { serializeData, serializeDomainObject } from './serialize.ts'
import { TestValue, testValueAdapters } from './testUtils.ts'

describe('serializeDomainObject', () => {
	it('serializes a domain object through a supplied adapter', () => {
		expect(serializeDomainObject(new TestValue('test'), testValueAdapters)).toEqual({ type: 'TestValue', value: 'test' })
	})

	it('rejects invalid domain objects and unknown types', () => {
		class MissingType {}
		class NonStringType { readonly type = 3 }
		class UnknownType { readonly type = 'Unknown' }

		expect(() => serializeDomainObject(new MissingType() as never)).toThrow(/string type/)
		expect(() => serializeDomainObject(new NonStringType() as never)).toThrow(/string type/)
		expect(() => serializeDomainObject(new UnknownType())).toThrow(/unknown type/)
	})
})

describe('serializeData', () => {
	it('preserves JSON-safe primitives and recursively uses supplied adapters', () => {
		expect(serializeData({ array: ['text', true, 3, null, new TestValue('test')] }, testValueAdapters)).toEqual({
			array: ['text', true, 3, null, { type: 'TestValue', value: 'test' }],
		})
	})

	it('rejects unsupported, sparse, and circular data', () => {
		expect(() => serializeData(undefined)).toThrow()
		expect(() => serializeData(new Array(1))).toThrow(/sparse/)
		const circular: { self?: unknown } = {}
		circular.self = circular
		expect(() => serializeData(circular)).toThrow(/circular/)
	})
})
