import { describe, expect, it } from 'vitest'

import { findIndexPath, findOptimum, findOptimumIndex, findValue, findWithValue, isIn } from './finding.ts'

describe('array finding', () => {
	it('checks membership and finds mapped values', () => {
		expect(isIn('a', ['a', 'b'] as const)).toBe(true)
		expect(findWithValue([1, 2, 3], (value, index) => value === 2 ? index : undefined)).toEqual({ index: 1, element: 2, value: 1 })
		expect(findValue([1, 2], value => value === 1 ? false : undefined)).toBe(false)
		expect(findValue([1], () => undefined)).toBeUndefined()
	})

	it('finds paths through nested arrays', () => {
		expect(findIndexPath([1, [2, [3]]], 3)).toEqual([1, 1, 0])
		expect(findIndexPath([1, 2], 4)).toBeUndefined()
	})

	it('finds optimum indices and elements', () => {
		expect(findOptimumIndex([3, 1, 4, 2], (a, b) => a > b)).toBe(2)
		expect(findOptimum([3, 1, 4], (a, b) => a < b)).toBe(1)
		expect(findOptimumIndex([], () => true)).toBe(-1)
		expect(findOptimum([], () => true)).toBeUndefined()
	})
})
