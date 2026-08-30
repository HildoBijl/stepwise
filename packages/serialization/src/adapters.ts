import type { AnySerializationAdapter, SerializationAdapters } from './types.ts'

export const serializationAdapters = {} satisfies SerializationAdapters

export function getSerializationAdapter(type: string, customSerializationAdapters?: SerializationAdapters): AnySerializationAdapter | undefined {
	if (customSerializationAdapters !== undefined && Object.hasOwn(customSerializationAdapters, type)) return customSerializationAdapters[type]
	return undefined
}
