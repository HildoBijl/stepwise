import { describe, expect, it } from 'vitest'

import { comparePolynomialCoefficients } from './comparison'
import { negatePolynomial, addConstantToPolynomial, scalePolynomial, oneMinusPolynomial, addPolynomials, subtractPolynomials, multiplyPolynomials, raisePolynomialToPower, getPolynomialPowers } from './manipulation'

describe('Check mathematical functions:', () => {
	describe('negatePolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = negatePolynomial(expression)
			expect(comparePolynomialCoefficients(applied.coefficients, [[-2, -3], [-4, -5]])).toBe(true)
		})
	})

	describe('addConstantToPolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = addConstantToPolynomial(expression, 6)
			expect(comparePolynomialCoefficients(applied.coefficients, [[8, 3], [4, 5]])).toBe(true)
		})

		it('works on a polynomial without variables', () => {
			expect(addConstantToPolynomial({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 5, variables: [] })
		})

		it('rejects an invalid addition', () => {
			expect(() => addConstantToPolynomial({ coefficients: 2, variables: [] }, Number.NaN)).toThrow()
		})
	})

	describe('scalePolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = scalePolynomial(expression, 3)
			expect(comparePolynomialCoefficients(applied.coefficients, [[6, 9], [12, 15]])).toBe(true)
		})

		it('works on a polynomial without variables', () => {
			expect(scalePolynomial({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 6, variables: [] })
		})

		it('rejects an invalid factor', () => {
			expect(() => scalePolynomial({ coefficients: 2, variables: [] }, Number.POSITIVE_INFINITY)).toThrow()
		})
	})

	describe('oneMinusPolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = oneMinusPolynomial(expression)
			expect(comparePolynomialCoefficients(applied.coefficients, [[-1, -3], [-4, -5]])).toBe(true)
			expect(applied.variables).toEqual(expression.variables)
		})
	})

	describe('addPolynomials', () => {
		it('rejects an empty expression list', () => {
			expect(() => addPolynomials([])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const expression2 = { coefficients: [6, 7], variables: ['a'] }

			const applied = addPolynomials([expression1, expression2])
			expect(comparePolynomialCoefficients(applied.coefficients, [[8, 3], [11, 5]])).toBe(true)
		})
	})

	describe('multiplyPolynomials', () => {
		it('rejects an empty expression list', () => {
			expect(() => multiplyPolynomials([])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const expression2 = { coefficients: [6, 7], variables: ['a'] }

			const applied = multiplyPolynomials([expression1, expression2])
			expect(comparePolynomialCoefficients(applied.coefficients, [[12, 18], [38, 51], [28, 35]])).toBe(true)
		})
	})

	describe('subtractPolynomials', () => {
		it('subtracts polynomials with different variable sets', () => {
			const result = subtractPolynomials({ coefficients: [2, 3], variables: ['a'] }, { coefficients: [1, 4], variables: ['b'] })
			expect(result.variables).toEqual(['a', 'b'])
			expect(comparePolynomialCoefficients(result.coefficients, [[1, -4], [3, 0]])).toBe(true)
		})
	})

	describe('raisePolynomialToPower', () => {
		it('returns the multiplicative identity for exponent zero', () => {
			expect(raisePolynomialToPower({ coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }, 0)).toEqual({ coefficients: [[1]], variables: ['a', 'b'] })
		})

		it('works for a polynomial without variables', () => {
			expect(raisePolynomialToPower({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 8, variables: [] })
		})

		it('works correctly for a single variable', () => {
			const expression = { coefficients: [6, 7], variables: ['a'] }
			const applied = raisePolynomialToPower(expression, 3)
			expect(comparePolynomialCoefficients(applied.coefficients, [6 ** 3, 3 * 6 ** 2 * 7, 3 * 6 * 7 ** 2, 7 ** 3])).toBe(true)
			expect(applied.variables).toEqual(expect.arrayContaining(expression.variables))
		})
		
		it.each([-1, 1.5, Number.NaN])('rejects invalid exponent %s', exponent => {
			expect(() => raisePolynomialToPower({ coefficients: [1, 1], variables: ['x'] }, exponent)).toThrow()
		})
	})

	describe('getPolynomialPowers', () => {
		it('returns every power through the requested maximum', () => {
			expect(getPolynomialPowers({ coefficients: [1, 1], variables: ['x'] }, 3)).toEqual([
				{ coefficients: [1], variables: ['x'] },
				{ coefficients: [1, 1], variables: ['x'] },
				{ coefficients: [1, 2, 1], variables: ['x'] },
				{ coefficients: [1, 3, 3, 1], variables: ['x'] },
			])
		})
	})
})
