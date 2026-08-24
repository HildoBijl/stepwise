import type { InputValue } from './types'
import { inputValueAdapters } from './adapters/registry'

export function toInputValue<Input extends InputValue = InputValue, DomainValue = unknown>(value: DomainValue, type: string): Input {
	if (typeof type !== 'string') throw new TypeError(`Invalid toInputValue call: expected a string type.`)
	const adapter = Object.hasOwn(inputValueAdapters, type) ? inputValueAdapters[type as keyof typeof inputValueAdapters] : undefined
	if (adapter === undefined) throw new Error(`Invalid toInputValue call: unknown type "${type}".`)
	return adapter.toInputValue(value as never) as Input
}
