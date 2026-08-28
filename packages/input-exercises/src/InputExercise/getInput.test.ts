import { describe, expect, it } from 'vitest'

import type { CheckInputData } from './types.ts'
import { getInput, getInputs } from './getInput.ts'

class ExampleInput {
	constructor(readonly value: number) {}
}

const objectInput = new ExampleInput(4)
const data = { input: { count: 3, label: 'three', accepted: true, objectInput } } as unknown as CheckInputData

describe('getInput', () => {
	it.each([
		['count', 'number', 3],
		['label', 'string', 'three'],
		['accepted', 'boolean', true],
	] as const)('retrieves a %s primitive', (key, type, expected) => {
		expect(getInput(key, data, type)).toBe(expected)
	})

	it('retrieves and types a class instance', () => {
		expect(getInput('objectInput', data, ExampleInput)).toBe(objectInput)
	})

	it('rejects missing and incorrectly typed values', () => {
		expect(() => getInput('missing', data, 'number')).toThrow(TypeError)
		expect(() => getInput('label', data, 'number')).toThrow(TypeError)
		expect(() => getInput('count', data, ExampleInput)).toThrow(TypeError)
	})
})

describe('getInputs', () => {
	it('retrieves multiple values sharing one type', () => {
		const input = { input: { left: 2, right: 5 } } as unknown as CheckInputData
		expect(getInputs(['left', 'right'], input, 'number')).toEqual([2, 5])
	})

	it('retrieves values with different types', () => {
		expect(getInputs(['count', 'label', 'objectInput'], data, ['number', 'string', ExampleInput])).toEqual([3, 'three', objectInput])
	})

	it('rejects a different number of keys and types', () => {
		expect(() => getInputs(['count', 'label'], data, ['number'] as never)).toThrow(RangeError)
	})
})
