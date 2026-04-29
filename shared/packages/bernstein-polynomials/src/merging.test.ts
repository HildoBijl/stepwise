import { compareNumberArrays } from '@step-wise/utils'

import { mergeBernsteinCoefficients, mergeBernsteinCoefficientsElementwise } from './merging'

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
