import { compareNumberArrays } from '@step-wise/utils'

import { smoothBernsteinCoefficientsWithFactor } from './smoothing'

describe('Check smoothing functions:', () => {
	describe('smoothWithFactor', () => {
		it('correctly smooths distributions', () => {
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithFactor([0, 1], 1 / 2), [1 / 6, 1 / 3, 1 / 2])).toBe(true)
			expect(compareNumberArrays(smoothBernsteinCoefficientsWithFactor([0, 1 / 3, 2 / 3], 3 / 4), [5 / 140, 10 / 140, 15 / 140, 20 / 140, 25 / 140, 30 / 140, 35 / 140])).toBe(true)
		})
	})
})
