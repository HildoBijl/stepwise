import { approximatelyEqual, compareNumberArrays, sum } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { maxBernsteinDegreeBeforeSmoothing, maxBernsteinSmoothingDegree, smoothBernsteinCoefficientsToDegree, smoothBernsteinCoefficientsWithRetentionFactor } from './smoothing'

function expectValidCoefficients(coefficients: readonly number[]): void {
	expect(coefficients.every(coefficient => coefficient >= 0)).toBe(true)
	expect(approximatelyEqual(sum(coefficients), 1)).toBe(true)
}

describe('smoothBernsteinCoefficientsToDegree', () => {
	it('smooths coefficients to known values', () => {
		expect(compareNumberArrays(smoothBernsteinCoefficientsToDegree([0, 1], 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
	})

	it('produces normalized non-negative coefficients of the requested degree', () => {
		const coefficients = smoothBernsteinCoefficientsToDegree([0.1, 0.2, 0.7], 8)
		expect(coefficients).toHaveLength(9)
		expectValidCoefficients(coefficients)
	})

	it('caps the smoothing degree', () => {
		expect(smoothBernsteinCoefficientsToDegree([1], maxBernsteinSmoothingDegree + 50)).toHaveLength(maxBernsteinSmoothingDegree + 1)
	})

	it('handles degree zero without mutating the input', () => {
		const coefficients = [0.2, 0.8]
		expect(smoothBernsteinCoefficientsToDegree(coefficients, 0)).toEqual([1])
		expect(coefficients).toEqual([0.2, 0.8])
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid smoothing degree %s', degree => {
		expect(() => smoothBernsteinCoefficientsToDegree([1], degree)).toThrow()
	})
})

describe('smoothBernsteinCoefficientsWithRetentionFactor', () => {
	it('smooths coefficients to known values', () => {
		expect(compareNumberArrays(smoothBernsteinCoefficientsWithRetentionFactor([0, 1], 1 / 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
		expect(compareNumberArrays(smoothBernsteinCoefficientsWithRetentionFactor([0, 1 / 3, 2 / 3], 3 / 4), [5 / 140, 10 / 140, 15 / 140, 20 / 140, 25 / 140, 30 / 140, 35 / 140])).toBe(true)
	})

	it('handles boundary retention factors', () => {
		const coefficients = [0.2, 0.8]
		expect(smoothBernsteinCoefficientsWithRetentionFactor(coefficients, 0)).toEqual([1])
		expect(smoothBernsteinCoefficientsWithRetentionFactor(coefficients, 1)).toBe(coefficients)
		expect(smoothBernsteinCoefficientsWithRetentionFactor([1], 0.5)).toEqual([1])
	})

	it('forces smoothing for excessively high degrees', () => {
		const coefficients = Array.from({ length: maxBernsteinDegreeBeforeSmoothing + 2 }, () => 1 / (maxBernsteinDegreeBeforeSmoothing + 2))
		const result = smoothBernsteinCoefficientsWithRetentionFactor(coefficients, 0.99999)
		expect(result).toHaveLength(maxBernsteinSmoothingDegree + 1)
		expectValidCoefficients(result)
	})

	it.each([NaN, Infinity, -0.1, 1.1])('rejects invalid retention factor %s', retentionFactor => {
		expect(() => smoothBernsteinCoefficientsWithRetentionFactor([0, 1], retentionFactor)).toThrow()
	})
})
