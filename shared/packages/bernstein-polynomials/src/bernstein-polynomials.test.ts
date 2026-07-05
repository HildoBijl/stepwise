import { compareNumbers, compareNumberArrays } from '@step-wise/utils'

import { getBernsteinOrder, normalizeBernsteinCoefficients } from './fundamentals'
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
			expect(compareNumbers(getBernsteinVariance([0, 1]), 1 / 18)).toBe(true)
			expect(compareNumbers(getBernsteinVariance([0, 0, 1, 0]), 1 / 25)).toBe(true)
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
		it('throws on coefficient lists of unequal size', () => {
			expect(() => mergeBernsteinCoefficientsElementwise([0, 1], [1])).toThrow()
		})
	})
})
