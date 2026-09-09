import { describe, expect, it } from 'vitest'

import { first, last } from './reading.ts'

describe('array reading', () => {
	it('reads positions from non-empty arrays', () => {
		expect(first([1, 2, 3])).toBe(1)
		expect(last([1, 2, 3])).toBe(3)
		expect(first([1, 2, 3], { offset: 1 })).toBe(2)
		expect(last([1, 2, 3], { offset: 1 })).toBe(2)
	})

	it('handles out-of-bounds reads according to options', () => {
		expect(first([], { allowOutOfBounds: true })).toBeUndefined()
		expect(last([], { allowOutOfBounds: true })).toBeUndefined()
		expect(first([1], { offset: 1, allowOutOfBounds: true })).toBeUndefined()
		expect(last([1], { offset: 1, allowOutOfBounds: true })).toBeUndefined()
		expect(() => first([])).toThrow(RangeError)
		expect(() => first([1], { offset: 1 })).toThrow(RangeError)
		expect(() => last([1], { offset: 1 })).toThrow(RangeError)
	})

	it('rejects invalid offsets', () => {
		expect(() => first([1], { offset: -1 })).toThrow(RangeError)
		expect(() => last([1], { offset: 0.5 })).toThrow(TypeError)
	})
})
