import { ensureBoolean, isPlainObject } from '@step-wise/js-utils'

import type { ValueEqualityAdapter, ValueEqualityOptions } from './types.ts'

export function areValuesEqual<TValue, TOptions extends ValueEqualityOptions = never>(equality: ValueEqualityAdapter<TValue, TOptions>, inputValue: unknown, expectedValue: unknown, equalityOptions?: TOptions): boolean {
	if (!isPlainObject(equality) || typeof equality.isValue !== 'function' || (equality.isOptions !== undefined && typeof equality.isOptions !== 'function') || typeof equality.areEqual !== 'function') throw new TypeError(`Invalid areValuesEqual call: expected an equality adapter.`)
	if (!equality.isValue(inputValue)) throw new TypeError(`Invalid areValuesEqual call: the input value does not match the equality adapter.`)
	if (!equality.isValue(expectedValue)) throw new TypeError(`Invalid areValuesEqual call: the expected value does not match the equality adapter.`)
	if (equalityOptions !== undefined && (equality.isOptions === undefined || !equality.isOptions(equalityOptions))) throw new TypeError(`Invalid areValuesEqual call: the equality options do not match the equality adapter.`)
	return ensureBoolean(equality.areEqual(inputValue, expectedValue, equalityOptions))
}
