import { describe, expect, it } from 'vitest'

import { ensureArray, ensureNumberArray, ensureNumericArray, hasDuplicates, isArray, isEmptyArray, isNumberArray, isNumericArray } from './checks.ts'

describe('array checks', () => {
	it('recognizes and ensures arrays', () => {
		const array = Object.freeze([1, 2])
		expect(isArray(array)).toBe(true)
		expect(isArray({})).toBe(false)
		expect(isEmptyArray([])).toBe(true)
		expect(isEmptyArray([1])).toBe(false)
		expect(ensureArray(array)).toBe(array)
		expect(() => ensureArray('array')).toThrow(TypeError)
	})

	it('distinguishes number and numeric arrays', () => {
		expect(isNumberArray([1, 2])).toBe(true)
		expect(isNumberArray([1, '2'])).toBe(false)
		expect(isNumericArray([1, '2'])).toBe(true)
		expect(isNumericArray([1, 'two'])).toBe(false)
		expect(ensureNumberArray([1, 2])).toEqual([1, 2])
		expect(() => ensureNumberArray([1, '2'])).toThrow(TypeError)
		expect(ensureNumericArray([1, '2'])).toEqual([1, 2])
	})

	it('detects duplicates with default or custom equality', () => {
		expect(hasDuplicates([1, 2, 1])).toBe(true)
		expect(hasDuplicates([1, 2, 3])).toBe(false)
		expect(hasDuplicates(['A', 'a'], (a, b) => a.toLowerCase() === b.toLowerCase())).toBe(true)
	})
})
