import { describe, expect, expectTypeOf, it } from 'vitest'

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
		const input = getInput('objectInput', data, ExampleInput)
		expectTypeOf(input).toEqualTypeOf<ExampleInput>()
		expect(input).toBe(objectInput)
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
		const values = getInputs(['left', 'right'], input, 'number')
		expectTypeOf(values).toEqualTypeOf<readonly [number, number]>()
		expect(values).toEqual([2, 5])
	})

	it('retrieves values with different types', () => {
		const values = getInputs(['count', 'label', 'objectInput'], data, ['number', 'string', ExampleInput])
		expectTypeOf(values).toEqualTypeOf<readonly [number, string, ExampleInput]>()
		expect(values).toEqual([3, 'three', objectInput])
	})

	it('rejects a different number of keys and types', () => {
		expect(() => getInputs(['count', 'label'], data, ['number'] as never)).toThrow(RangeError)
	})
})
