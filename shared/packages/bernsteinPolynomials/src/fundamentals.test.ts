import { compareNumberArrays } from '@step-wise/utils'

import { ensureBernsteinCoefficients, getBernsteinOrder, normalizeBernsteinCoefficients } from './fundamentals'

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
