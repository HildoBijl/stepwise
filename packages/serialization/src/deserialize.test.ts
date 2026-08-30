import { describe, expect, it } from 'vitest'

import { deserializeData, deserializeDomainObject } from './deserialize.ts'
import { TestValue, testValueAdapters } from './testUtils.ts'

describe('deserializeDomainObject', () => {
	it('deserializes a domain object through a supplied adapter', () => {
		expect(deserializeDomainObject({ type: 'TestValue', value: 'test' }, testValueAdapters)).toEqual(new TestValue('test'))
	})

	it('rejects malformed and unknown serialized domain objects', () => {
		expect(() => deserializeDomainObject(null as never)).toThrow(/type and value/)
		expect(() => deserializeDomainObject({ type: 'Unknown', value: 3 })).toThrow(/unknown type/)
	})
})

describe('deserializeData', () => {
	it('preserves JSON-safe primitives and recursively uses supplied adapters', () => {
		expect(deserializeData({ array: ['text', true, 3, null, { type: 'TestValue', value: 'test' }] }, testValueAdapters)).toEqual({
			array: ['text', true, 3, null, new TestValue('test')],
		})
	})

	it('leaves unknown type objects as plain data', () => {
		expect(deserializeData({ type: 'Unknown', value: 3 })).toEqual({ type: 'Unknown', value: 3 })
	})
})