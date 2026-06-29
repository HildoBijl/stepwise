export type InputValue<Type extends string = string, Value = unknown> = { type: Type, value: Value }

export type InterpreterEntry<InputValue, DomainValue> = {
	interpret: (inputValue: InputValue) => DomainValue
	toInputValue: (domainValue: DomainValue) => InputValue
}
