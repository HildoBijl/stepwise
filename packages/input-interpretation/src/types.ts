import type { PlainDataValue } from '@step-wise/js-utils'

export type InputValue<Type extends string = string, Value extends PlainDataValue = PlainDataValue> = { type: Type, value: Value }

export type InterpreterEntry<InputValue, DomainValue> = {
	interpret: (inputValue: InputValue) => DomainValue
	toInputValue: (domainValue: DomainValue) => InputValue
}
