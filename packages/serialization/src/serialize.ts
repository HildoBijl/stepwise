import { isObject, isPlainObject, mapValues } from '@step-wise/js-utils'

import type { SerializedDomainObject } from './types.ts'
import { getSerializationAdapter } from './adapters/index.ts'

export type SerializedData = null | string | number | boolean | SerializedDomainObject | SerializedData[] | { [key: string]: SerializedData }

export function serializeDomainObject<TSerialized extends SerializedDomainObject = SerializedDomainObject>(domainValue: unknown): TSerialized {
	if (!isObject(domainValue) || isPlainObject(domainValue)) throw new TypeError(`Invalid serializeDomainObject call: expected a non-plain object with a type.`)
	const type = Reflect.get(domainValue, 'type')
	if (typeof type !== 'string') throw new TypeError(`Invalid serializeDomainObject call: expected an object with a string type.`)
	const adapter = getSerializationAdapter(type)
	if (adapter === undefined) throw new TypeError(`Invalid serializeDomainObject call: unknown type "${type}".`)
	if (!adapter.isDomainValue(domainValue)) throw new TypeError(`Invalid serializeDomainObject call: value does not match type "${type}".`)
	const serializedValue = adapter.serialize(domainValue as never)
	if (!adapter.isSerializedValue(serializedValue)) throw new TypeError(`Invalid serialization adapter for type "${type}": returned an invalid serialized value.`)
	return serializedValue as TSerialized
}

export function serializeData(value: unknown): SerializedData {
	return serializeValue(value, new WeakSet())
}

function serializeValue(value: unknown, ancestors: WeakSet<object>): SerializedData {
	// Handle fundamental types.
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new TypeError(`Invalid serializeData call: expected numbers to be finite.`)
		return value
	}

	// Handle arrays/plain objects.
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new TypeError(`Invalid serializeData call: cannot serialize circular data.`)
		ancestors.add(value)
		try {
			if (Array.isArray(value)) {
				for (let index = 0; index < value.length; index++) {
					if (!Object.hasOwn(value, index)) throw new TypeError(`Invalid serializeData call: cannot serialize sparse arrays.`)
				}
				return value.map(item => serializeValue(item, ancestors))
			}
			return mapValues(value, item => serializeValue(item, ancestors))
		} finally {
			ancestors.delete(value)
		}
	}

	// Handle domain values.
	if (isObject(value)) return serializeDomainObject(value)

	// Should never happen.
	throw new TypeError(`Invalid serializeData call: cannot serialize value of type "${typeof value}".`)
}
