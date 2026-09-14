import { type PlainDataValue, hasOnlyKeys, isPlainObject } from '@step-wise/js-utils'

/*
 * Fundamental types.
 */

export type InputValue<TType extends string = string, TValue extends PlainDataValue = PlainDataValue> = {
	type: TType
	value: TValue
}

/*
 * Adapters.
 */

export type InputValueAdapter<TInputValue extends InputValue, TDomainValue> = {
	isInputValue: (value: unknown) => value is TInputValue
	isDomainValue: (value: unknown) => value is TDomainValue
	interpret: (inputValue: TInputValue) => TDomainValue
	toInputValue: (domainValue: TDomainValue) => TInputValue
}

export type AnyInputValueAdapter = {
	isInputValue: (value: unknown) => boolean
	isDomainValue: (value: unknown) => boolean
	interpret: (inputValue: never) => unknown
	toInputValue: (domainValue: never) => InputValue
}

export type InputValueAdapters = Record<string, AnyInputValueAdapter>

/*
 * Guard functions.
 */

export function isInputValueAdapter(value: unknown): value is AnyInputValueAdapter {
	return isPlainObject(value) && hasOnlyKeys(value, ['isInputValue', 'isDomainValue', 'interpret', 'toInputValue']) && typeof value.isInputValue === 'function' && typeof value.isDomainValue === 'function' && typeof value.interpret === 'function' && typeof value.toInputValue === 'function'
}
