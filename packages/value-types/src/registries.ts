import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'
import type { SerializationAdapters } from '@step-wise/serialization'
import type { InputValueAdapters } from '@step-wise/input-interpretation'
import type { ValueEqualityAdapters } from '@step-wise/value-equality'

import type { ValueType, ValueTypes } from './types.ts'

export function combineValueTypes(...registries: readonly ValueTypes[]): ValueTypes {
	const combined: ValueTypes = Object.create(null)
	for (const registry of registries) {
		validateValueTypes(registry)
		for (const [type, valueType] of Object.entries(registry)) {
			if (Object.hasOwn(combined, type)) throw new TypeError(`Cannot combine value types: duplicate type "${type}".`)
			combined[type] = valueType
		}
	}
	return combined
}

export function extractInputValueAdapters(valueTypes: ValueTypes): InputValueAdapters {
	return extractAdapters(valueTypes, 'inputValue')
}

export function extractSerializationAdapters(valueTypes: ValueTypes): SerializationAdapters {
	return extractAdapters(valueTypes, 'serialization')
}

export function extractValueEqualityAdapters(valueTypes: ValueTypes): ValueEqualityAdapters {
	return extractAdapters(valueTypes, 'equality')
}

function extractAdapters<TKey extends keyof ValueType>(valueTypes: ValueTypes, key: TKey): Record<string, NonNullable<ValueType[TKey]>> {
	validateValueTypes(valueTypes)
	const adapters: Record<string, NonNullable<ValueType[TKey]>> = Object.create(null)
	for (const [type, valueType] of Object.entries(valueTypes)) {
		const adapter = valueType[key]
		if (adapter !== undefined) adapters[type] = adapter
	}
	return adapters
}

function validateValueTypes(valueTypes: ValueTypes): void {
	if (!isPlainObject(valueTypes)) throw new TypeError(`Invalid value types: expected a plain object.`)
	for (const [type, valueType] of Object.entries(valueTypes)) {
		if (!isPlainObject(valueType) || !hasOnlyKeys(valueType, ['inputValue', 'serialization', 'equality'])) throw new TypeError(`Invalid value type "${type}": expected an object containing only adapters.`)
		for (const adapter of Object.values(valueType)) {
			if (!isPlainObject(adapter)) throw new TypeError(`Invalid value type "${type}": expected each adapter to be a plain object.`)
		}
	}
}
