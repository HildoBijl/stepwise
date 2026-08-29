import type { PlainDataValue } from '@step-wise/js-utils'

export type InputValue<TType extends string = string, TValue extends PlainDataValue = PlainDataValue> = { type: TType, value: TValue }

export type InputValueAdapter<TInputValue extends InputValue, TDomainValue> = {
	interpret: (inputValue: TInputValue) => TDomainValue
	toInputValue: (domainValue: TDomainValue) => TInputValue
}

/** An input-value adapter with its concrete value types erased for use in heterogeneous registries. */
export type AnyInputValueAdapter = {
	interpret: (inputValue: never) => unknown
	toInputValue: (domainValue: never) => InputValue
}

export type InputValueAdapters = Record<string, AnyInputValueAdapter>
