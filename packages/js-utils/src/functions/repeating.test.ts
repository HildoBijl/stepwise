import { describe, expect, it, vi } from 'vitest'

import { forEachCombination, repeat, repeatFromTo, repeatMultidimensional, repeatMultidimensionalFromTo } from './repeating.ts'

describe('function repetition', () => {
	it('repeats callbacks and values over ranges', () => {
		expect(repeat(3, index => index * 2)).toEqual([0, 2, 4])
		expect(repeatFromTo(-1, 1, index => index)).toEqual([-1, 0, 1])
		expect(repeatFromTo(1, 3, 'x')).toEqual(['x', 'x', 'x'])
		expect(repeat(0, () => 1)).toEqual([])
	})

	it('repeats over multidimensional ranges', () => {
		expect(repeatMultidimensional([2, 2], (i, j) => `${i}${j}`)).toEqual([['00', '01'], ['10', '11']])
		expect(repeatMultidimensional([], () => 4)).toBe(4)
		expect(repeatMultidimensionalFromTo([1, 2], [2, 3], (i, j) => i + j)).toEqual([[3, 4], [4, 5]])
		expect(() => repeatMultidimensionalFromTo([0], [1, 2], () => 0)).toThrow(RangeError)
	})

	it('visits every ascending combination', () => {
		const callback = vi.fn()
		forEachCombination(4, 2, callback)
		expect(callback.mock.calls).toEqual([[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]])
		expect(() => forEachCombination(2, 3, callback)).toThrow(RangeError)
	})
})
