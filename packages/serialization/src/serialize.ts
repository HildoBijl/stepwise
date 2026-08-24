import { isObject, isPlainObject, mapValues } from '@step-wise/js-utils'

import type { SerializableObject, SerializedObject } from './types'
import { serializers } from './objects'

export type SerializedData = null | string | number | boolean | SerializedObject | SerializedData[] | { [key: string]: SerializedData }

export function serialize<Serialized extends SerializedObject = SerializedObject, DomainValue extends SerializableObject = SerializableObject>(value: DomainValue): Serialized {
	const candidate: unknown = value
	if (!isObject(candidate) || isPlainObject(candidate)) throw new TypeError(`Invalid serialize call: expected a non-plain object with a type.`)
	const type = (candidate as { type?: unknown }).type
	if (typeof type !== 'string') throw new TypeError(`Invalid serialize call: expected an object with a string type.`)
	const entry = serializers[type as keyof typeof serializers]
	if (entry === undefined) throw new TypeError(`Invalid serialize call: unknown type "${type}".`)
	return entry.serialize(candidate as never) as Serialized
}

export function serializeAll(value: unknown): SerializedData {
	return serializeValue(value, new WeakSet())
}

function serializeValue(value: unknown, ancestors: WeakSet<object>): SerializedData {
	// Handle fundamental types.
	if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
	if (typeof value === 'number') {
		if (!Number.isFinite(value)) throw new TypeError(`Invalid serializeAll call: expected numbers to be finite.`)
		return value
	}

	// Handle arrays/plain objects.
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new TypeError(`Invalid serializeAll call: cannot serialize circular data.`)
		ancestors.add(value)
		try {
			if (Array.isArray(value)) {
				for (let index = 0; index < value.length; index++) {
					if (!Object.hasOwn(value, index)) throw new TypeError(`Invalid serializeAll call: cannot serialize sparse arrays.`)
				}
				return value.map(item => serializeValue(item, ancestors))
			}
			return mapValues(value, item => serializeValue(item, ancestors))
		} finally {
			ancestors.delete(value)
		}
	}

	// Handle domain values.
	if (isObject(value)) return serialize(value as SerializableObject)

	// Should never happen.
	throw new TypeError(`Invalid serializeAll call: cannot serialize value of type "${typeof value}".`)
}
