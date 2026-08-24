import type { PlainDataValue } from '@step-wise/js-utils'

export type InputValue<TType extends string = string, TValue extends PlainDataValue = PlainDataValue> = { type: TType, value: TValue }

export type InputValueAdapter<TInputValue, TDomainValue> = {
	interpret: (inputValue: TInputValue) => TDomainValue
	toInputValue: (domainValue: TDomainValue) => TInputValue
}
