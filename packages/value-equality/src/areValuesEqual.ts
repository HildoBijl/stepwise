import { ensureBoolean } from '@step-wise/js-utils'

import { type AnyValueEqualityAdapter, isValueEqualityAdapter } from './types.ts'

export function areValuesEqual(equality: AnyValueEqualityAdapter, inputValue: unknown, expectedValue: unknown, equalityOptions?: unknown): boolean {
	if (!isValueEqualityAdapter(equality)) throw new TypeError(`Invalid areValuesEqual call: expected an equality adapter.`)
	if (!equality.isValue(inputValue)) throw new TypeError(`Invalid areValuesEqual call: the input value does not match the equality adapter.`)
	if (!equality.isValue(expectedValue)) throw new TypeError(`Invalid areValuesEqual call: the expected value does not match the equality adapter.`)
	if (equalityOptions !== undefined && (equality.isOptions === undefined || !equality.isOptions(equalityOptions))) throw new TypeError(`Invalid areValuesEqual call: the equality options do not match the equality adapter.`)
	return ensureBoolean(equality.areEqual(inputValue as never, expectedValue as never, equalityOptions as never))
}