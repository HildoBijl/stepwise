import type { InputValue, InputValueAdapters } from './types.ts'
import { getInputValueAdapter } from './adapters/registry.ts'

export function toInputValue<Input extends InputValue = InputValue>(value: unknown, type: string, inputValueAdapters?: InputValueAdapters): Input {
	if (typeof type !== 'string') throw new TypeError(`Invalid toInputValue call: expected a string type.`)
	const adapter = getInputValueAdapter(type, inputValueAdapters)
	if (adapter === undefined) throw new Error(`Invalid toInputValue call: unknown type "${type}".`)
	if (!adapter.isDomainValue(value)) throw new Error(`Invalid toInputValue call: value does not match type "${type}".`)
	const inputValue = adapter.toInputValue(value as never)
	if (!adapter.isInputValue(inputValue)) throw new Error(`Invalid input value adapter for type "${type}": returned an invalid input value.`)
	return inputValue as Input
}
