import { afterEach, describe, expect, it, vi } from 'vitest'

import { randomIndices, randomSubset, sample, shuffle } from './random.ts'

afterEach(() => vi.restoreAllMocks())

describe('random array utilities', () => {
	it('samples uniformly and with weights', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.6)
		expect(sample(['a', 'b', 'c'])).toBe('b')
		expect(sample(['a', 'b', 'c'], { weights: [0, 2, 0] })).toBe('b')
		expect(() => sample([])).toThrow(RangeError)
		expect(() => sample(['a'], { weights: [0] })).toThrow(RangeError)
	})

	it('shuffles a copy deterministically', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		const input = [1, 2, 3]
		expect(shuffle(input)).toEqual([2, 3, 1])
		expect(input).toEqual([1, 2, 3])
	})

	it('selects unique indices and subsets', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0)
		expect(randomIndices(4, { count: 2, randomOrder: false })).toEqual([1, 2])
		expect(randomIndices(3, { count: 1, weights: [0, 1, 0] })).toEqual([1])
		expect(randomSubset(['a', 'b', 'c'], { count: 1, weights: [0, 1, 0] })).toEqual(['b'])
		expect(() => randomIndices(2, { count: 3 })).toThrow(RangeError)
		expect(() => randomIndices(2, { count: 2, weights: [1, 0] })).toThrow(RangeError)
	})
})
