import { describe, expect, it } from 'vitest'

import { hasOnlyKeys, isPlainObject, isString } from '@step-wise/js-utils'

import type { SerializationAdapter, SerializationAdapters } from './types.ts'
import { deserializeData, deserializeDomainObject } from './deserialize.ts'
import { serializeData, serializeDomainObject } from './serialize.ts'

const CustomType = 'CustomValue'
type SerializedCustomValue = { type: typeof CustomType, value: string }

class CustomValue {
	readonly type = CustomType
	constructor(readonly value: string) {}
}

const customAdapter = {
	isDomainValue: (value: unknown): value is CustomValue => value instanceof CustomValue,
	isSerializedValue: (value: unknown): value is SerializedCustomValue => isPlainObject(value) && hasOnlyKeys(value, ['type', 'value']) && value.type === CustomType && isString(value.value),
	serialize: (value: CustomValue): SerializedCustomValue => ({ type: CustomType, value: value.value }),
	deserialize: (value: SerializedCustomValue): CustomValue => new CustomValue(value.value),
} satisfies SerializationAdapter<CustomValue, SerializedCustomValue>

const customAdapters = { [CustomType]: customAdapter } satisfies SerializationAdapters

describe('custom serialization adapters', () => {
	it('serializes and deserializes a custom domain object', () => {
		const value = new CustomValue('test')
		const serialized = serializeDomainObject<SerializedCustomValue>(value, customAdapters)
		expect(serialized).toEqual({ type: CustomType, value: 'test' })
		expect(deserializeDomainObject<CustomValue>(serialized, customAdapters)).toEqual(value)
	})

	it('uses custom adapters throughout nested data', () => {
		const data = { values: [new CustomValue('first'), { nested: new CustomValue('second') }] }
		const serialized = serializeData(data, customAdapters)
		expect(serialized).toEqual({ values: [{ type: CustomType, value: 'first' }, { nested: { type: CustomType, value: 'second' } }] })
		expect(deserializeData(serialized, customAdapters)).toEqual(data)
	})


	it('ignores inherited custom adapter entries', () => {
		const inheritedAdapters = Object.create(customAdapters) as SerializationAdapters
		expect(() => serializeDomainObject(new CustomValue('test'), inheritedAdapters)).toThrow(/unknown type/)
	})

	it('rejects invalid adapter output in either direction', () => {
		const invalidSerializeAdapter = { ...customAdapter, serialize: () => ({ type: CustomType, value: 3 }) as never }
		const invalidDeserializeAdapter = { ...customAdapter, deserialize: () => ({ type: CustomType }) as never }

		expect(() => serializeDomainObject(new CustomValue('test'), { [CustomType]: invalidSerializeAdapter })).toThrow(/invalid serialized value/)
		expect(() => deserializeDomainObject({ type: CustomType, value: 'test' }, { [CustomType]: invalidDeserializeAdapter })).toThrow(/invalid domain value/)
	})

	it('rejects sparse and circular nested data when custom adapters are present', () => {
		const sparse: unknown[] = [new CustomValue('test')]
		sparse.length = 2
		expect(() => serializeData(sparse, customAdapters)).toThrow(/sparse/)
		expect(() => deserializeData(new Array(1), customAdapters)).toThrow(/sparse/)

		const circular: unknown[] = []
		circular.push(circular)
		expect(() => serializeData({ value: new CustomValue('test'), circular }, customAdapters)).toThrow(/circular/)
		expect(() => deserializeData({ type: CustomType, value: circular }, customAdapters)).toThrow(/circular/)
	})
})
