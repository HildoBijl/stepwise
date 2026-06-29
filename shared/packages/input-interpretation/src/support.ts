import type { InputValue } from './types'

export function makeInputValue<Type extends string, Value>(type: Type, value: Value): InputValue<Type, Value> {
	return { type, value }
}
