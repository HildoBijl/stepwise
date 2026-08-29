import { describe, expect, it } from 'vitest'

import { getUnivariatePolynomialCoefficients } from './conversion.ts'

describe('getUnivariatePolynomialCoefficients', () => {
	it('returns coefficients in ascending exponent order and fills gaps', () => {
		expect(getUnivariatePolynomialCoefficients({
			terms: [{ coefficient: 2, exponents: [0] }, { coefficient: -3, exponents: [2] }, { coefficient: 5, exponents: [4] }],
			variables: ['x'],
		})).toEqual([2, 0, -3, 0, 5])
	})

	it('returns a single zero coefficient for the zero polynomial', () => {
		expect(getUnivariatePolynomialCoefficients({ terms: [], variables: ['x'] })).toEqual([0])
	})

	it('rejects constant and multivariable polynomials', () => {
		expect(() => getUnivariatePolynomialCoefficients({ terms: [{ coefficient: 2, exponents: [] }], variables: [] })).toThrow(RangeError)
		expect(() => getUnivariatePolynomialCoefficients({ terms: [{ coefficient: 2, exponents: [1, 0] }], variables: ['x', 'y'] })).toThrow(RangeError)
	})
})
