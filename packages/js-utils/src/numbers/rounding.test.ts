import { describe, expect, it } from 'vitest'

import { roundTo, roundToDigits } from './rounding.ts'

describe('number rounding', () => {
	it('rounds to decimal positions', () => {
		expect(roundTo(12.345, 2)).toBeCloseTo(12.35)
		expect(roundTo(1234, -2)).toBe(1200)
		expect(roundTo(Infinity, 2)).toBe(Infinity)
	})

	it('rounds to significant digits', () => {
		expect(roundToDigits(1234, 2)).toBe(1200)
		expect(roundToDigits(0.01234, 2)).toBeCloseTo(0.012)
		expect(roundToDigits(10, 0)).toBe(0)
		expect(roundToDigits(10, Infinity)).toBe(10)
	})
})
