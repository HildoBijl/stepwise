import { compareNumberArrays } from '@step-wise/utils'

import { getBernsteinOrder, normalizeBernsteinCoefficients } from './fundamentals'

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
