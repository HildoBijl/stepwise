import { isPlainObject, mapValues } from '@step-wise/utils'

import type { SerializableObject, SerializedObject } from './types'
import * as objects from './objects'

export type SerializedData = null | undefined | string | number | boolean | SerializedObject | SerializedData[] | { [key: string]: SerializedData }

export function serialize(value: SerializableObject): SerializedObject {
	if (typeof value !== 'object' || value === null) throw new Error(`Invalid serialize call: expected an object with a type.`)
	if (typeof value.type !== 'string') throw new Error(`Invalid serialize call: expected an object with a string type.`)
	const entry = objects[value.type as keyof typeof objects]
	if (entry === undefined) throw new Error(`Invalid serialize call: unknown type "${value.type}".`)
	return entry.serialize(value as never)
}

export function serializeAll(value: unknown): SerializedData {
	if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value)) return value.map(serializeAll)
	if (isPlainObject(value)) return mapValues(value, item => serializeAll(item))
	if (typeof value === 'object') return serialize(value as SerializableObject)
	throw new Error(`Invalid serializeAll call: cannot serialize value of type "${typeof value}".`)
}
