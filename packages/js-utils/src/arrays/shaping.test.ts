import { describe, expect, it } from 'vitest'

import { cartesianProduct, flattenDeep } from './shaping'

describe('array shaping', () => {
	it('deeply flattens nested arrays', () => {
		const input = [1, [2, [3]], []]
		expect(flattenDeep(input)).toEqual([1, 2, 3])
		expect(input).toEqual([1, [2, [3]], []])
	})

	it('builds Cartesian products in input order', () => {
		expect(cartesianProduct([[1, 2], [3, 4]])).toEqual([[1, 3], [1, 4], [2, 3], [2, 4]])
		expect(cartesianProduct([[1, 2]])).toEqual([[1], [2]])
		expect(cartesianProduct([[1], []])).toEqual([])
		expect(() => cartesianProduct([])).toThrow(RangeError)
	})
})
