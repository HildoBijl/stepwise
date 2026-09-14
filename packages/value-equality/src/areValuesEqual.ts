import { ensureBoolean } from '@step-wise/js-utils'

import { type AnyValueEqualityAdapter, type ValueEqualityAdapters, isValueEqualityAdapter } from './types.ts'
import { getValueEqualityAdapter } from './adapters.ts'

// Set up a function that can compare values of various types, based on given value equality adapters.
export function createAreValuesEqual(equalityAdapters: ValueEqualityAdapters) {
	return (type: string, inputValue: unknown, expectedValue: unknown, options?: unknown): boolean => {
		const adapter = getValueEqualityAdapter(type, equalityAdapters)
		if (adapter === undefined) throw new Error(`Cannot compare values: no equality adapter found for type "${type}".`)
		return areValuesEqualFromAdapter(adapter, inputValue, expectedValue, options)
	}
}

// Given a value equality adapter, check if two values are equal.
export function areValuesEqualFromAdapter(equality: AnyValueEqualityAdapter, inputValue: unknown, expectedValue: unknown, equalityOptions?: unknown): boolean {
	// Check the adapter.
	if (!isValueEqualityAdapter(equality)) throw new TypeError(`Invalid areValuesEqualFromAdapter call: expected an equality adapter.`)

	// Check the given values.
	if (!equality.isValue(inputValue)) throw new TypeError(`Invalid areValuesEqualFromAdapter call: the input value does not match the equality adapter.`)
	if (!equality.isValue(expectedValue)) throw new TypeError(`Invalid areValuesEqualFromAdapter call: the expected value does not match the equality adapter.`)

	// Check the options.
	if (equalityOptions !== undefined && (equality.isOptions === undefined || !equality.isOptions(equalityOptions))) throw new TypeError(`Invalid areValuesEqualFromAdapter call: the equality options do not match the equality adapter.`)

	// Run the comparison.
	return ensureBoolean(equality.areEqual(inputValue as never, expectedValue as never, equalityOptions as never))
}
