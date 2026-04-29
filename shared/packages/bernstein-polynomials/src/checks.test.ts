import { compareNumberArrays } from '@step-wise/utils'

import { ensureBernsteinCoefficients } from './checks'

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
