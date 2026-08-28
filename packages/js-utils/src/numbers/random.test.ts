import { afterEach, describe, expect, it, vi } from 'vitest'

import { randomBoolean, randomInteger, randomNumber } from './random.ts'

afterEach(() => vi.restoreAllMocks())

describe('random numbers', () => {
	it('uses probability boundaries for booleans', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.25)
		expect(randomBoolean(0.5)).toBe(true)
		expect(randomBoolean(0)).toBe(false)
		expect(() => randomBoolean(2)).toThrow(RangeError)
	})

	it('maps Math.random onto a numeric range', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.25)
		expect(randomNumber(10, 14)).toBe(11)
		expect(() => randomNumber(2, 1)).toThrow(RangeError)
	})

	it('selects inclusive integers and respects exclusions', () => {
		vi.spyOn(Math, 'random').mockReturnValue(0.5)
		expect(randomInteger(1, 3)).toBe(2)
		expect(randomInteger(1, 3, { exclude: [2, 3] })).toBe(1)
		expect(() => randomInteger(1, 1, { exclude: [1] })).toThrow(RangeError)
	})
})
