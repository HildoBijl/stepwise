import { hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

export type ValueEqualityOptions = Record<string, unknown>

export type ValueEqualityAdapter<TValue = unknown, TOptions extends ValueEqualityOptions = never> = {
	isValue: (value: unknown) => value is TValue
	areEqual: (inputValue: TValue, expectedValue: TValue, options: TOptions | undefined) => boolean
} & ([TOptions] extends [never]
	? { isOptions?: never }
	: { isOptions: (options: unknown) => options is TOptions })

export type AnyValueEqualityAdapter = {
	isValue: (value: unknown) => boolean
	isOptions?: (options: unknown) => boolean
	areEqual: (inputValue: never, expectedValue: never, options: never) => boolean
}

export type ValueEqualityAdapters = Record<string, AnyValueEqualityAdapter>
export function isValueEqualityAdapter(value: unknown): value is AnyValueEqualityAdapter {
	return isPlainObject(value) && hasOnlyKeys(value, ['isValue', 'isOptions', 'areEqual']) && typeof value.isValue === 'function' && (value.isOptions === undefined || typeof value.isOptions === 'function') && typeof value.areEqual === 'function'
}
