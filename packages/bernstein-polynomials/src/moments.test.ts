import { approximatelyEqual } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { getBernsteinExpectedValue, getBernsteinMoment, getBernsteinVariance } from './moments.ts'
import { reflectBernsteinCoefficients } from './fundamentals.ts'

describe('getBernsteinMoment', () => {
	it('calculates known moments', () => {
		expect(getBernsteinMoment([0, 1], 0)).toBe(1)
		expect(getBernsteinMoment([0, 1], 1)).toBeCloseTo(2 / 3)
		expect(getBernsteinMoment([0, 1], 2)).toBeCloseTo(1 / 2)
		expect(getBernsteinMoment([0, 1], 3)).toBeCloseTo(2 / 5)
		expect(getBernsteinMoment([0, 0, 1, 0], 2)).toBeCloseTo(2 / 5)
	})

	it('keeps high-order moments finite and within the unit interval', () => {
		const moment = getBernsteinMoment([0, 1], 200)
		expect(moment).toBeCloseTo(1 / 101)
		expect(Number.isFinite(moment)).toBe(true)
		expect(moment).toBeGreaterThanOrEqual(0)
		expect(moment).toBeLessThanOrEqual(1)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid exponent %s', exponent => {
		expect(() => getBernsteinMoment([1], exponent)).toThrow()
	})
})

describe('getBernsteinExpectedValue', () => {
	it('calculates known expected values', () => {
		expect(getBernsteinExpectedValue([1])).toBe(0.5)
		expect(getBernsteinExpectedValue([0, 1])).toBe(2 / 3)
		expect(getBernsteinExpectedValue([0, 0, 1, 0])).toBe(3 / 5)
		expect(getBernsteinExpectedValue([0, 1, 0])).toBe(0.5)
	})

	it('reflects an expected value around one half', () => {
		const coefficients = [0.1, 0.2, 0.7]
		expect(getBernsteinExpectedValue(reflectBernsteinCoefficients(coefficients))).toBeCloseTo(1 - getBernsteinExpectedValue(coefficients))
	})
})

describe('getBernsteinVariance', () => {
	it('calculates known variances', () => {
		expect(approximatelyEqual(getBernsteinVariance([0, 1]), 1 / 18)).toBe(true)
		expect(approximatelyEqual(getBernsteinVariance([0, 0, 1, 0]), 1 / 25)).toBe(true)
	})

	it('is unchanged by reflection and remains non-negative', () => {
		const coefficients = [0.1, 0.2, 0.7]
		const variance = getBernsteinVariance(coefficients)
		expect(getBernsteinVariance(reflectBernsteinCoefficients(coefficients))).toBeCloseTo(variance)
		expect(variance).toBeGreaterThanOrEqual(0)
	})
})
