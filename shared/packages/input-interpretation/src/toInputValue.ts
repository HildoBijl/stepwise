import { serializeAll } from '@step-wise/serialization'

import type { InputValue } from './types'
import * as objects from './objects'

export function toInputValue<Input extends InputValue = InputValue, DomainValue = unknown>(value: DomainValue, type?: string): Input {
	if (type === undefined) return serializeAll(value) as Input
	const entry = objects[type as keyof typeof objects]
	if (entry === undefined) throw new Error(`Invalid toInputValue call: unknown type "${type}".`)
	return entry.toInputValue(value as never) as Input
}
