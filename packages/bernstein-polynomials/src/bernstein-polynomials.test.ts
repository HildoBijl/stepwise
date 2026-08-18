import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { getBernsteinOrder, increaseBernsteinCoefficientsOrder, normalizeBernsteinCoefficients } from './fundamentals'
import { ensureBernsteinCoefficients } from './checks'
import { getBernsteinExpectedValue, getBernsteinVariance, getBernsteinMoment } from './moments'
import { getBernsteinPDF } from './distributions'
import { smoothBernsteinCoefficientsWithFactor } from './smoothing'
import { mergeBernsteinCoefficients, mergeBernsteinCoefficientsElementwise } from './merging'

describe('Check fundamental functions:', () => {
	describe('getBernsteinOrder', () => {
		it('gives the correct order on a coefficient array', () => {
			expect(getBernsteinOrder([0.1, 0.2, 0.3, 0.4])).toBe(3)
		})
	})
	describe('normalizeBernsteinCoefficients', () => {
		it('properly normalizes an array', () => {
			expect(compareNumberArrays(normalizeBernsteinCoefficients([1, 2, 3, 4]), [0.1, 0.2, 0.3, 0.4])).toBe(true)
		})
	})
	describe('increaseBernsteinCoefficientsOrder', () => {
		it('throws when lowering the order', () => {
			expect(() => increaseBernsteinCoefficientsOrder([0.2, 0.8], 0)).toThrow()
		})
		it('returns the original coefficients when the order is unchanged', () => {
			const coefficients = [0.2, 0.8]
			expect(increaseBernsteinCoefficientsOrder(coefficients, 1)).toBe(coefficients)
		})
		it('increases the order and keeps the coefficients normalized', () => {
			const increasedCoefficients = increaseBernsteinCoefficientsOrder([0, 1], 2)
			expect(compareNumberArrays(increasedCoefficients, [0, 1 / 3, 2 / 3])).toBe(true)
			expect(approximatelyEqual(increasedCoefficients.reduce((sum, coefficient) => sum + coefficient, 0), 1)).toBe(true)
		})
		it('preserves the PDF', () => {
			const coefficients = [0.1, 0.2, 0.7]
			const increasedCoefficients = increaseBernsteinCoefficientsOrder(coefficients, 6)
			const pdf = getBernsteinPDF(coefficients)
			const increasedPdf = getBernsteinPDF(increasedCoefficients)
			;[0, 0.1, 0.25, 0.5, 0.9, 1].forEach(x => expect(approximatelyEqual(increasedPdf(x), pdf(x))).toBe(true))
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
			expect(getBernsteinMoment([0, 1], 2)).toBe(1 / 2)
			expect(getBernsteinMoment([0, 1], 3)).toBe(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 2)).toBe(2 / 5)
			expect(getBernsteinMoment([0, 0, 1, 0], 3)).toBe(2 / 7)
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
	})
})

describe('Check smoothing functions:', () => {
	describe('smoothWithFactor', () => {
		it('correctly smooths distributions', () => {
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithFactor([0, 1], 1 / 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithFactor([0, 1 / 3, 2 / 3], 3 / 4), [5 / 140, 10 / 140, 15 / 140, 20 / 140, 25 / 140, 30 / 140, 35 / 140])).toBe(true)
		})
	})
})

describe('Check merging functions:', () => {
	describe('mergeBernsteinCoefficients', () => {
		it('correctly merges distributions', () => {
			expect(compareNumberArrays(mergeBernsteinCoefficients([0, 1], [1, 0]), [0, 1, 0])).toBe(true)
			expect(compareNumberArrays(mergeBernsteinCoefficients([2 / 5, 3 / 5], [0, 1]), [0, 1 / 4, 3 / 4])).toBe(true)
		})
	})
	describe('mergeBernsteinCoefficientsElementwise', () => {
		it('correctly merges element-wise', () => {
			expect(compareNumberArrays(mergeBernsteinCoefficientsElementwise([0.2, 0.8], [0.8, 0.2]), [0.5, 0.5])).toBe(true)
			expect(compareNumberArrays(mergeBernsteinCoefficientsElementwise([3 / 7, 4 / 7], [3 / 7, 4 / 7]), [9 / 25, 16 / 25])).toBe(true)
		})
		it('increases unequal orders before merging element-wise', () => {
			expect(compareNumberArrays(mergeBernsteinCoefficientsElementwise([1, 0], [0.2, 0.3, 0.5]), [4 / 7, 3 / 7, 0])).toBe(true)
		})
		it('merges default coefficients with higher-order coefficients', () => {
			expect(compareNumberArrays(mergeBernsteinCoefficientsElementwise([1], [0.2, 0.3, 0.5]), [0.2, 0.3, 0.5])).toBe(true)
		})
	})
})
