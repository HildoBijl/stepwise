import { describe, expect, it } from 'vitest'

import { count, cumulative, product, sum } from './iteration.ts'

describe('array iteration', () => {
	it('calculates sums, products and cumulative sums', () => {
		expect(sum([1, -2, 3])).toBe(2)
		expect(sum([])).toBe(0)
		expect(product([2, 3, 4])).toBe(24)
		expect(product([])).toBe(1)
		expect(cumulative([2, -1, 3])).toEqual([2, 1, 4])
	})

	it('counts truthy callback results with indices', () => {
		expect(count([4, 5, 6], (value, index) => value === 5 || index === 2)).toBe(2)
	})
})
