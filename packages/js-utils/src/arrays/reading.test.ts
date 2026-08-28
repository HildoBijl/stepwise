import { describe, expect, it } from 'vitest'

import { first, last, secondLast } from './reading.ts'

describe('array reading', () => {
	it('reads positions from non-empty arrays', () => {
		expect(first([1, 2, 3])).toBe(1)
		expect(last([1, 2, 3])).toBe(3)
		expect(secondLast([1, 2, 3])).toBe(2)
	})

	it('handles out-of-bounds reads according to options', () => {
		expect(first([], { allowOutOfBounds: true })).toBeUndefined()
		expect(last([], { allowOutOfBounds: true })).toBeUndefined()
		expect(secondLast([1], { allowOutOfBounds: true })).toBeUndefined()
		expect(() => first([])).toThrow(RangeError)
		expect(() => secondLast([1])).toThrow(RangeError)
	})
})
