import { isPlainObject } from '@step-wise/js-utils'

import type { ValueTypeAdapters, ValueTypes } from './types.ts'
import { isValueType } from './guards.ts'

// Combine a set of ValueTypes registries into one, ensuring there are no duplicates. (Unless the ValueTypes are identical.)
export function combineValueTypes(...registries: readonly ValueTypes[]): ValueTypes {
	const combined: ValueTypes = Object.create(null)
	for (const registry of registries) {
		validateValueTypes(registry)
		for (const [type, valueType] of Object.entries(registry)) {
			if (Object.hasOwn(combined, type) && combined[type] !== valueType) throw new TypeError(`Cannot combine value types: duplicate type "${type}".`)
			combined[type] = valueType
		}
	}
	return combined
}

// Turn a list of ValueTypes registries into an aggregated ValueTypeAdapters object.
export function extractValueTypeAdapters(registries: ValueTypes): ValueTypeAdapters {
	validateValueTypes(registries)
	const adapters: ValueTypeAdapters = {
		serializationAdapters: Object.create(null),
		inputValueAdapters: Object.create(null),
		equalityAdapters: Object.create(null),
	}
	for (const [type, valueType] of Object.entries(registries)) {
		if (valueType.serialization !== undefined) adapters.serializationAdapters[type] = valueType.serialization
		if (valueType.inputValue !== undefined) adapters.inputValueAdapters[type] = valueType.inputValue
		if (valueType.equality !== undefined) adapters.equalityAdapters[type] = valueType.equality
	}
	return adapters
}

function validateValueTypes(valueTypes: ValueTypes): void {
	if (!isPlainObject(valueTypes)) throw new TypeError(`Invalid value types: expected a plain object.`)
	for (const [type, valueType] of Object.entries(valueTypes)) {
		if (!isValueType(valueType)) throw new TypeError(`Invalid value type "${type}": expected a complete serialization, input-value, or equality adapter for each supplied capability.`)
	}
}
