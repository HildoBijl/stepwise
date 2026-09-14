import type { InputValue, InputValueAdapters } from './types.ts'
import { getInputValueAdapter } from './adapters.ts'

// Turn a given domain value of a given type into an input value.
export function toInputValue<Input extends InputValue = InputValue>(value: unknown, type: string, inputValueAdapters?: InputValueAdapters): Input {
	if (typeof type !== 'string') throw new TypeError(`Invalid toInputValue call: expected a string type.`)

	// Load the respective adapters.
	const adapter = getInputValueAdapter(type, inputValueAdapters)
	if (adapter === undefined) throw new Error(`Invalid toInputValue call: unknown type "${type}".`)
	if (!adapter.isDomainValue(value)) throw new Error(`Invalid toInputValue call: value does not match type "${type}".`)

	// Apply the adapters and check the resulting input value.
	const inputValue = adapter.toInputValue(value as never)
	if (!adapter.isInputValue(inputValue)) throw new Error(`Invalid input value adapter for type "${type}": returned an invalid input value.`)
	return inputValue as Input
}
