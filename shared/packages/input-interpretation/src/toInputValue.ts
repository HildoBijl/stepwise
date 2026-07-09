import { serializeAll } from '@step-wise/serialization'

import type { InputValue } from './types'
import { interpreters } from './objects'

export function toInputValue<Input extends InputValue = InputValue, DomainValue = unknown>(value: DomainValue, type?: string): Input {
	if (type === undefined) return serializeAll(value) as Input
	const interpreter = interpreters[type as keyof typeof interpreters]
	if (interpreter === undefined) throw new Error(`Invalid toInputValue call: unknown type "${type}".`)
	return interpreter.toInputValue(value as never) as Input
}
