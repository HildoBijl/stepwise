import { describe, expect, it } from 'vitest'

import { polynomialToString } from './display'

describe('Check display functions:', () => {
	describe('polynomialToString', () => {
		it('displays a polynomial without variables', () => {
			expect(polynomialToString({ matrix: 5, list: [] })).toBe('5')
		})

		it('works correctly', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			expect(polynomialToString(expression)).toBe('2+3*b+4*a+5*a*b')
		})
	})
})
