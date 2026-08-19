import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { elevateBernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients, reflectBernsteinCoefficients } from './fundamentals'
import { ensureBernsteinCoefficients } from './checks'
import { getBernsteinExpectedValue, getBernsteinVariance, getBernsteinMoment } from './moments'
import { getBernsteinCDF, getBernsteinPDF, getBernsteinPDFDerivative, getBernsteinPDFMaximum, getBernsteinQuantileFunction } from './distributions'
import { smoothBernsteinCoefficientsToDegree, smoothBernsteinCoefficientsWithRetentionFactor } from './smoothing'
import { multiplyBernsteinCoefficientsElementwise, multiplyBernsteinPDFs } from './merging'

describe('Check fundamental functions:', () => {
	describe('getBernsteinDegree', () => {
		it('gives the correct degree of a coefficient array', () => {
			expect(getBernsteinDegree([0.1, 0.2, 0.3, 0.4])).toBe(3)
		})
		it('rejects an empty coefficient array', () => {
			expect(() => getBernsteinDegree([])).toThrow(RangeError)
		})
	})
	describe('normalizeBernsteinCoefficients', () => {
		it('properly normalizes an array', () => {
			expect(compareNumberArrays(normalizeBernsteinCoefficients([1, 2, 3, 4]), [0.1, 0.2, 0.3, 0.4])).toBe(true)
		})
		it('throws when the coefficients sum to zero', () => {
			expect(() => normalizeBernsteinCoefficients([0, 0])).toThrow(RangeError)
			expect(() => normalizeBernsteinCoefficients([-1, 0])).toThrow(RangeError)
		})
	})
	describe('elevateBernsteinCoefficients', () => {
		it('throws when lowering the degree', () => {
			expect(() => elevateBernsteinCoefficients([0.2, 0.8], 0)).toThrow()
		})
		it('returns the original coefficients when the degree is unchanged', () => {
			const coefficients = [0.2, 0.8]
			expect(elevateBernsteinCoefficients(coefficients, 1)).toBe(coefficients)
		})
		it('elevates the degree and keeps the coefficients normalized', () => {
			const elevatedCoefficients = elevateBernsteinCoefficients([0, 1], 2)
			expect(compareNumberArrays(elevatedCoefficients, [0, 1 / 3, 2 / 3])).toBe(true)
			expect(approximatelyEqual(elevatedCoefficients.reduce((sum, coefficient) => sum + coefficient, 0), 1)).toBe(true)
		})
		it('preserves the PDF', () => {
			const coefficients = [0.1, 0.2, 0.7]
			const elevatedCoefficients = elevateBernsteinCoefficients(coefficients, 6)
			const pdf = getBernsteinPDF(coefficients)
			const elevatedPdf = getBernsteinPDF(elevatedCoefficients)
			;[0, 0.1, 0.25, 0.5, 0.9, 1].forEach(x => expect(approximatelyEqual(elevatedPdf(x), pdf(x))).toBe(true))
		})
		it('rejects unsafe degrees', () => {
			expect(() => elevateBernsteinCoefficients([1], Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError)
		})
	})
	describe('reflectBernsteinCoefficients', () => {
		it('reflects a distribution around one half', () => {
			expect(reflectBernsteinCoefficients([0.1, 0.2, 0.7])).toEqual([0.7, 0.2, 0.1])
		})
	})
})

describe('Check fundamental functions:', () => {
	describe('ensureBernsteinCoefficients', () => {
		it('throws an error on non-array coefficients', () => {
			expect(() => ensureBernsteinCoefficients(1)).toThrow()
		})
		it('throws an error on non-normalized coefficients', () => {
			expect(() => ensureBernsteinCoefficients([1, 1])).toThrow()
		})
		it('rejects empty arrays regardless of the normalization requirement', () => {
			expect(() => ensureBernsteinCoefficients([])).toThrow(RangeError)
			expect(() => ensureBernsteinCoefficients([], { requireNormalized: false })).toThrow(RangeError)
		})
		it('passes on valid coefficient arrays', () => {
			const coefficients = [0.1, 0.3, 0.6]
			expect(compareNumberArrays(ensureBernsteinCoefficients(coefficients), coefficients)).toBe(true)
		})
	})
})

describe('Check moment functions:', () => {
	describe('getBernsteinExpectedValue', () => {
		it('gives correct values', () => {
			expect(getBernsteinExpectedValue([0, 1])).toBe(2 / 3)
			expect(getBernsteinExpectedValue([0, 0, 1, 0])).toBe(3 / 5)
		})
	})
	describe('getBernsteinMoment', () => {
		it('gives correct values', () => {
			expect(getBernsteinMoment([0, 1], 2)).toBeCloseTo(1 / 2)
			expect(getBernsteinMoment([0, 1], 3)).toBeCloseTo(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 2)).toBeCloseTo(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 3)).toBeCloseTo(2 / 7)
		})
		it('keeps high-order moments finite', () => {
			expect(getBernsteinMoment([0, 1], 200)).toBeCloseTo(1 / 101)
		})
		it('rejects unsafe exponents', () => {
			expect(() => getBernsteinMoment([1], Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError)
		})
	})
	describe('getBernsteinVariance', () => {
		it('gives correct values', () => {
			expect(approximatelyEqual(getBernsteinVariance([0, 1]), 1 / 18)).toBe(true)
			expect(approximatelyEqual(getBernsteinVariance([0, 0, 1, 0]), 1 / 25)).toBe(true)
		})
	})
})

describe('Check distribution functions:', () => {
	describe('getBernsteinPDF', () => {
		it('gives a correct PDF', () => {
			const pdf = getBernsteinPDF([0, 0, 1, 0]) // 12*x^2*(1-x).
			expect(pdf(-1)).toBe(0)
			expect(pdf(0)).toBe(0)
			expect(pdf(1)).toBe(0)
			expect(pdf(2)).toBe(0)
			expect(pdf(0.5)).toBe(1.5)
		})
		it('validates inputs while supporting infinities', () => {
			const pdf = getBernsteinPDF([1])
			expect(pdf(-Infinity)).toBe(0)
			expect(pdf(Infinity)).toBe(0)
			expect(() => pdf(NaN)).toThrow(TypeError)
		})
	})
	describe('getBernsteinPDFDerivative', () => {
		it('returns zero everywhere for a degree-zero distribution', () => {
			const derivative = getBernsteinPDFDerivative([1])
			expect([-1, 0, 0.5, 1, 2].map(derivative)).toEqual([0, 0, 0, 0, 0])
		})
		it('validates inputs while supporting infinities', () => {
			const derivative = getBernsteinPDFDerivative([1])
			expect(derivative(-Infinity)).toBe(0)
			expect(derivative(Infinity)).toBe(0)
			expect(() => derivative(NaN)).toThrow(TypeError)
		})
	})
	describe('getBernsteinCDF', () => {
		it('validates inputs while supporting infinities', () => {
			const cdf = getBernsteinCDF([1])
			expect(cdf(-Infinity)).toBe(0)
			expect(cdf(Infinity)).toBe(1)
			expect(() => cdf(NaN)).toThrow(TypeError)
		})
	})
	describe('getBernsteinQuantileFunction', () => {
		it('accepts probabilities from zero through one', () => {
			const quantile = getBernsteinQuantileFunction([1])
			expect(quantile(0)).toBe(0)
			expect(quantile(0.5)).toBeCloseTo(0.5)
			expect(quantile(1)).toBe(1)
		})
		it.each([NaN, -0.1, 1.1, Infinity])('rejects invalid probability %s', probability => {
			expect(() => getBernsteinQuantileFunction([1])(probability)).toThrow()
		})
		it('rejects unsafe iteration counts', () => {
			expect(() => getBernsteinQuantileFunction([1], { iterations: Number.MAX_SAFE_INTEGER + 1 })).toThrow(RangeError)
		})
	})
	describe('getBernsteinPDFMaximum', () => {
		it('finds an interior maximum', () => {
			const maximum = getBernsteinPDFMaximum([0, 1, 0])
			expect(maximum.x).toBeCloseTo(0.5)
			expect(maximum.density).toBeCloseTo(1.5)
		})
		it('finds an endpoint maximum for a U-shaped PDF', () => {
			const maximum = getBernsteinPDFMaximum([0.5, 0, 0.5])
			expect([0, 1]).toContain(maximum.x)
			expect(maximum.density).toBeCloseTo(1.5)
		})
		it('handles constant PDFs', () => {
			expect(getBernsteinPDFMaximum([1])).toEqual({ x: 0, density: 1 })
		})
		it('rejects unsafe iteration counts', () => {
			expect(() => getBernsteinPDFMaximum([1], { iterations: Number.MAX_SAFE_INTEGER + 1 })).toThrow(RangeError)
		})
	})
})

describe('Check smoothing functions:', () => {
	describe('smoothWithRetentionFactor', () => {
		it('correctly smooths distributions', () => {
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithRetentionFactor([0, 1], 1 / 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithRetentionFactor([0, 1 / 3, 2 / 3], 3 / 4), [5 / 140, 10 / 140, 15 / 140, 20 / 140, 25 / 140, 30 / 140, 35 / 140])).toBe(true)
		})
		it.each([NaN, Infinity, -0.1, 1.1])('rejects invalid smoothing factor %s', factor => {
			expect(() => smoothBernsteinCoefficientsWithRetentionFactor([0, 1], factor)).toThrow()
		})
	})
	describe('smoothToDegree', () => {
		it('rejects unsafe smoothing degrees', () => {
			expect(() => smoothBernsteinCoefficientsToDegree([1], Number.MAX_SAFE_INTEGER + 1)).toThrow(RangeError)
		})
	})
})

describe('Check merging functions:', () => {
	describe('multiplyBernsteinPDFs', () => {
		it('correctly merges distributions', () => {
			expect(compareNumberArrays(multiplyBernsteinPDFs([0, 1], [1, 0]), [0, 1, 0])).toBe(true)
			expect(compareNumberArrays(multiplyBernsteinPDFs([2 / 5, 3 / 5], [0, 1]), [0, 1 / 4, 3 / 4])).toBe(true)
		})
	})
	describe('multiplyBernsteinCoefficientsElementwise', () => {
		it('correctly merges element-wise', () => {
			expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([0.2, 0.8], [0.8, 0.2]), [0.5, 0.5])).toBe(true)
			expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([3 / 7, 4 / 7], [3 / 7, 4 / 7]), [9 / 25, 16 / 25])).toBe(true)
		})
		it('elevates unequal degrees before merging element-wise', () => {
			expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([1, 0], [0.2, 0.3, 0.5]), [4 / 7, 3 / 7, 0])).toBe(true)
		})
		it('merges default coefficients with higher-degree coefficients', () => {
			expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([1], [0.2, 0.3, 0.5]), [0.2, 0.3, 0.5])).toBe(true)
		})
		it('throws when the coefficient arrays have no overlap', () => {
			expect(() => multiplyBernsteinCoefficientsElementwise([1, 0], [0, 1])).toThrow(RangeError)
		})
	})
})
