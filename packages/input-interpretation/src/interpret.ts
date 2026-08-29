import { isPlainObject, mapValues } from '@step-wise/js-utils'

import type { InputValueAdapters } from './types.ts'
import { getInputValueAdapter } from './adapters/registry.ts'

export function interpretInputValue<DomainValue = unknown>(inputValue: unknown, inputValueAdapters?: InputValueAdapters): DomainValue {
	if (!isPlainObject(inputValue) || typeof inputValue.type !== 'string' || !Object.hasOwn(inputValue, 'value')) throw new Error(`Invalid input value: expected an object with a type and value.`)
	ensureValidStructure(inputValue, new WeakSet())
	const adapter = getInputValueAdapter(inputValue.type, inputValueAdapters)
	if (adapter === undefined) throw new Error(`Invalid input value: unknown type "${inputValue.type}".`)
	if (!adapter.isInputValue(inputValue)) throw new Error(`Invalid input value: value does not match type "${inputValue.type}".`)
	const domainValue = adapter.interpret(inputValue as never)
	if (!adapter.isDomainValue(domainValue)) throw new Error(`Invalid input value adapter for type "${inputValue.type}": returned an invalid domain value.`)
	return domainValue as DomainValue
}

export function interpretInputData(value: unknown, inputValueAdapters?: InputValueAdapters): unknown {
	return interpretValue(value, new WeakSet(), inputValueAdapters)
}

function interpretValue(value: unknown, ancestors: WeakSet<object>, inputValueAdapters?: InputValueAdapters): unknown {
	if (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
	if (Array.isArray(value) || isPlainObject(value)) {
		if (ancestors.has(value)) throw new Error(`Invalid interpretInputData call: cannot interpret circular data.`)
		ancestors.add(value)
		try {
			if (Array.isArray(value)) {
				ensureDenseArray(value)
				return value.map(item => interpretValue(item, ancestors, inputValueAdapters))
			}
			if (typeof value.type === 'string' && getInputValueAdapter(value.type, inputValueAdapters) !== undefined) return interpretInputValue(value, inputValueAdapters)
			return mapValues(value, item => interpretValue(item, ancestors, inputValueAdapters))
		} finally {
			ancestors.delete(value)
		}
	}
	throw new Error(`Invalid interpretInputData call: cannot interpret value of type "${typeof value}". Only plain objects, arrays and basic types are expected.`)
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
