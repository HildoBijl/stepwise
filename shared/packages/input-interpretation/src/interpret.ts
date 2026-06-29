import { isPlainObject, mapValues } from '@step-wise/utils'

import type { InputValue } from './types'
import * as objects from './objects'

export function interpretInputValue<DomainValue = unknown, Input extends InputValue = InputValue>(inputValue: Input): DomainValue {
	if (!isPlainObject(inputValue) || typeof inputValue.type !== 'string' || !('value' in inputValue)) throw new Error(`Invalid input value: expected an object with a type and value.`)
	const entry = objects[inputValue.type as keyof typeof objects]
	if (entry === undefined) throw new Error(`Invalid input value: unknown type "${inputValue.type}".`)
	return entry.interpret(inputValue as never) as DomainValue
}

export function interpretAllInputValues(value: unknown): unknown {
	if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value)) return value.map(item => interpretAllInputValues(item))
	if (isPlainObject(value)) {
		if (typeof value.type === 'string' && value.type in objects && 'value' in value) return interpretInputValue(value as InputValue)
		return mapValues(value, item => interpretAllInputValues(item))
	}
	throw new Error(`Invalid interpretAllInputValues call: cannot interpret value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
}
