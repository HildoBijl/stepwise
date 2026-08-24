import { isPlainObject, mapValues } from '@step-wise/js-utils'

import type { SerializedObject } from './types'
import { serializers } from './objects'

export function deserialize<DomainValue = unknown, Serialized extends SerializedObject = SerializedObject>(serialized: Serialized): DomainValue {
	if (!isPlainObject(serialized) || typeof serialized.type !== 'string' || !Object.hasOwn(serialized, 'value')) throw new TypeError(`Invalid serialized object: expected an object with a type and value.`)
	const entry = serializers[serialized.type as keyof typeof serializers]
	if (entry === undefined) throw new TypeError(`Invalid serialized object: unknown type "${serialized.type}".`)
	return entry.deserialize(serialized as never) as DomainValue
}

export function deserializeAll(value: unknown): unknown {
	return deserializeValue(value, new WeakSet())
}

function deserializeValue(value: unknown, ancestors: WeakSet<object>): unknown {
	// Handle fundamental types.
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new TypeError(`Invalid deserializeAll call: expected numbers to be finite.`)
		return value
	}

	// Handle arrays/objects.
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new TypeError(`Invalid deserializeAll call: cannot deserialize circular data.`)
		ancestors.add(value)
		try {
			// Check for disallowed sparse arrays.
			if (Array.isArray(value)) {
				for (let index = 0; index < value.length; index++) {
					if (!Object.hasOwn(value, index)) throw new TypeError(`Invalid deserializeAll call: cannot deserialize sparse arrays.`)
				}
			}

			// Handle serialized objects.
			if (isPlainObject(value) && typeof value.type === 'string' && Object.hasOwn(serializers, value.type)) {
				Object.values(value).forEach(item => ensureNoCircularReferences(item, ancestors)) // Check internally for circular references.
				return deserialize(value as SerializedObject)
			}

			// Traverse into the array/object.
			return Array.isArray(value) ? value.map(item => deserializeValue(item, ancestors)) : mapValues(value, item => deserializeValue(item, ancestors))
		} finally {
			ancestors.delete(value)
		}
	}

	// Other object types are not supported.
	throw new TypeError(`Invalid deserializeAll call: cannot deserialize value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
}

function ensureNoCircularReferences(value: unknown, ancestors: WeakSet<object>): void {
	if (!Array.isArray(value) && !isPlainObject(value)) return
	if (ancestors.has(value)) throw new TypeError(`Invalid deserializeAll call: cannot deserialize circular data.`)
	ancestors.add(value)
	try {
		Object.values(value).forEach(item => ensureNoCircularReferences(item, ancestors))
	} finally {
		ancestors.delete(value)
	}
}
