import { isPlainObject, mapValues } from '@step-wise/js-utils'

import type { InputValue } from './types'
import { interpreters } from './objects'

export function interpretInputValue<DomainValue = unknown, Input extends InputValue = InputValue>(inputValue: Input): DomainValue {
	if (!isPlainObject(inputValue) || typeof inputValue.type !== 'string' || !Object.hasOwn(inputValue, 'value')) throw new Error(`Invalid input value: expected an object with a type and value.`)
	ensureValidStructure(inputValue, new WeakSet())
	const interpreter = Object.hasOwn(interpreters, inputValue.type) ? interpreters[inputValue.type as keyof typeof interpreters] : undefined
	if (interpreter === undefined) throw new Error(`Invalid input value: unknown type "${inputValue.type}".`)
	return interpreter.interpret(inputValue as never) as DomainValue
}

export function interpretAllInputValues(value: unknown): unknown {
	return interpretValue(value, new WeakSet())
}

function interpretValue(value: unknown, ancestors: WeakSet<object>): unknown {
	if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new Error(`Invalid interpretAllInputValues call: cannot interpret circular data.`)
		ancestors.add(value)
		try {
			if (Array.isArray(value)) {
				ensureDenseArray(value)
				return value.map(item => interpretValue(item, ancestors))
			}
			if (typeof value.type === 'string' && Object.hasOwn(interpreters, value.type)) return interpretInputValue(value as InputValue)
			return mapValues(value, item => interpretValue(item, ancestors))
		} finally {
			ancestors.delete(value)
		}
	}
	throw new Error(`Invalid interpretAllInputValues call: cannot interpret value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
}

function ensureValidStructure(value: unknown, ancestors: WeakSet<object>): void {
	if (!Array.isArray(value) && !isPlainObject(value)) return
	if (ancestors.has(value)) throw new Error(`Invalid input value: cannot interpret circular data.`)
	ancestors.add(value)
	try {
		if (Array.isArray(value)) ensureDenseArray(value)
		Object.values(value).forEach(item => ensureValidStructure(item, ancestors))
	} finally {
		ancestors.delete(value)
	}
}

function ensureDenseArray(value: unknown[]): void {
	for (let index = 0; index < value.length; index++) {
		if (!Object.hasOwn(value, index)) throw new Error(`Invalid input value: cannot interpret sparse arrays.`)
	}
}
