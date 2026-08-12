import { isPlainObject, mapValues } from '@step-wise/utils'

import type { SerializedObject } from './types'
import * as objects from './objects'

export function deserialize<DomainValue = unknown, Serialized extends SerializedObject = SerializedObject>(serialized: Serialized): DomainValue {
	if (!isPlainObject(serialized) || typeof serialized.type !== 'string' || !('value' in serialized)) throw new Error(`Invalid serialized object: expected an object with a type and value.`)
	const entry = objects[serialized.type as keyof typeof objects]
	if (entry === undefined) throw new Error(`Invalid serialized object: unknown type "${serialized.type}".`)
	return entry.deserialize(serialized as never) as DomainValue
}

export function deserializeAll(value: unknown): unknown {
	if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value)) return value.map(item => deserializeAll(item))
	if (isPlainObject(value)) {
		if (typeof value.type === 'string' && value.type in objects && 'value' in value) return deserialize(value as SerializedObject)
		return mapValues(value, item => deserializeAll(item))
	}
	throw new Error(`Invalid deserializeAll call: cannot deserialize value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
}
