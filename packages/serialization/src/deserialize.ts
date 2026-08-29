import { isPlainObject, mapValues } from '@step-wise/js-utils'

import { getSerializationAdapter } from './adapters/index.ts'

export function deserializeDomainObject<TDomainValue = unknown>(serializedValue: unknown): TDomainValue {
	if (!isPlainObject(serializedValue) || typeof serializedValue.type !== 'string' || !Object.hasOwn(serializedValue, 'value')) throw new TypeError(`Invalid serialized domain object: expected an object with a type and value.`)
	const adapter = getSerializationAdapter(serializedValue.type)
	if (adapter === undefined) throw new TypeError(`Invalid serialized domain object: unknown type "${serializedValue.type}".`)
	if (!adapter.isSerializedValue(serializedValue)) throw new TypeError(`Invalid serialized domain object: value does not match type "${serializedValue.type}".`)
	const domainValue = adapter.deserialize(serializedValue as never)
	if (!adapter.isDomainValue(domainValue)) throw new TypeError(`Invalid serialization adapter for type "${serializedValue.type}": returned an invalid domain value.`)
	return domainValue as TDomainValue
}

export function deserializeData(value: unknown): unknown {
	return deserializeValue(value, new WeakSet())
}

function deserializeValue(value: unknown, ancestors: WeakSet<object>): unknown {
	// Handle fundamental types.
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new TypeError(`Invalid deserializeData call: expected numbers to be finite.`)
		return value
	}

	// Handle arrays/objects.
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new TypeError(`Invalid deserializeData call: cannot deserialize circular data.`)
		ancestors.add(value)
		try {
			// Check for disallowed sparse arrays.
			if (Array.isArray(value)) {
				for (let index = 0; index < value.length; index++) {
					if (!Object.hasOwn(value, index)) throw new TypeError(`Invalid deserializeData call: cannot deserialize sparse arrays.`)
				}
			}

			// Handle serialized objects.
			if (isPlainObject(value) && typeof value.type === 'string' && getSerializationAdapter(value.type) !== undefined) {
				Object.values(value).forEach(item => ensureNoCircularReferences(item, ancestors)) // Check internally for circular references.
				return deserializeDomainObject(value)
			}

			// Traverse into the array/object.
			return Array.isArray(value) ? value.map(item => deserializeValue(item, ancestors)) : mapValues(value, item => deserializeValue(item, ancestors))
		} finally {
			ancestors.delete(value)
		}
	}

	// Other object types are not supported.
	throw new TypeError(`Invalid deserializeData call: cannot deserialize value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
}

function ensureNoCircularReferences(value: unknown, ancestors: WeakSet<object>): void {
	if (!Array.isArray(value) && !isPlainObject(value)) return
	if (ancestors.has(value)) throw new TypeError(`Invalid deserializeData call: cannot deserialize circular data.`)
	ancestors.add(value)
	try {
		Object.values(value).forEach(item => ensureNoCircularReferences(item, ancestors))
	} finally {
		ancestors.delete(value)
	}
}
