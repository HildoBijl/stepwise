import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'
import type { PlainDataValue } from '@step-wise/js-utils'

/*
 * Fundamental types.
 */

export type SerializableDomainObject = {
	type: string
}

export type SerializedData = PlainDataValue

export type SerializedDomainObject<Type extends string = string, SerializedValue extends SerializedData = SerializedData> = {
	type: Type
	value: SerializedValue
}

/*
 * Adapters.
 */

export type SerializationAdapter<TDomainValue extends SerializableDomainObject, TSerialized extends SerializedDomainObject> = {
	isDomainValue: (value: unknown) => value is TDomainValue
	isSerializedValue: (value: unknown) => value is TSerialized
	serialize: (domainValue: TDomainValue) => TSerialized
	deserialize: (serializedValue: TSerialized) => TDomainValue
}

export type AnySerializationAdapter = {
	isDomainValue: (value: unknown) => boolean
	isSerializedValue: (value: unknown) => boolean
	serialize: (domainValue: never) => SerializedDomainObject
	deserialize: (serializedValue: never) => SerializableDomainObject
}

export type SerializationAdapters = Record<string, AnySerializationAdapter>

/*
 * Guard functions.
 */

export function isSerializationAdapter(value: unknown): value is AnySerializationAdapter {
	return isPlainObject(value) && hasOnlyKeys(value, ['isDomainValue', 'isSerializedValue', 'serialize', 'deserialize']) && typeof value.isDomainValue === 'function' && typeof value.isSerializedValue === 'function' && typeof value.serialize === 'function' && typeof value.deserialize === 'function'
}
