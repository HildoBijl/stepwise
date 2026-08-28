import { describe, expect, it } from 'vitest'

import { arithmeticSequence, integerRange, rangeByStep, subdivideRange } from './creation.ts'

describe('array creation', () => {
	it('creates inclusive integer ranges in both directions', () => {
		expect(integerRange(3)).toEqual([0, 1, 2, 3])
		expect(integerRange(2, -1)).toEqual([2, 1, 0, -1])
		expect(integerRange(2, 2)).toEqual([2])
	})

	it('creates arithmetic sequences and subdivisions', () => {
		expect(arithmeticSequence(2, 3, 4)).toEqual([2, 5, 8, 11])
		expect(subdivideRange(0, 1, 4)).toEqual([0, 0.25, 0.5, 0.75, 1])
		expect(() => arithmeticSequence(0, 1, 0)).toThrow(RangeError)
	})

	it('creates stepped ranges and validates direction', () => {
		expect(rangeByStep(0, 1, 0.4)).toEqual([0, 0.4, 0.8])
		expect(rangeByStep(3, 0, -1)).toEqual([3, 2, 1, 0])
		expect(rangeByStep(2, 2, -1)).toEqual([2])
		expect(() => rangeByStep(0, 3, -1)).toThrow(RangeError)
	})
})
