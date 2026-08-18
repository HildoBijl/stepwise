import { describe, expect, it } from 'vitest'

import { comparePolynomialCoefficients } from './comparison'
import { negatePolynomial, addConstantToPolynomial, scalePolynomial, oneMinusPolynomial, addPolynomials, subtractPolynomials, multiplyPolynomials, raisePolynomialToPower } from './manipulation'

describe('Check mathematical functions:', () => {
	describe('negatePolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = negatePolynomial(expression)
			expect(comparePolynomialCoefficients(applied.coefficients, [[-2, -3], [-4, -5]])).toBe(true)
			expect(applied.variables).toEqual(expression.variables)
		})
	})

	describe('addConstantToPolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = addConstantToPolynomial(expression, 6)
			expect(comparePolynomialCoefficients(applied.coefficients, [[8, 3], [4, 5]])).toBe(true)
			expect(applied.variables).toEqual(expression.variables)
		})

		it('works on a polynomial without variables', () => {
			expect(addConstantToPolynomial({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 5, variables: [] })
		})
	})

	describe('scalePolynomial', () => {
		it('works correctly', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = scalePolynomial(expression, 3)
			expect(comparePolynomialCoefficients(applied.coefficients, [[6, 9], [12, 15]])).toBe(true)
			expect(applied.variables).toEqual(expression.variables)
		})

		it('works on a polynomial without variables', () => {
			expect(scalePolynomial({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 6, variables: [] })
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
			// @ts-expect-error Verify the runtime guard for untyped JavaScript consumers.
			expect(() => addPolynomials([])).toThrow(RangeError)
		})

		it('rejects duplicate destination variables', () => {
			expect(() => addPolynomials([{ coefficients: [1, 2], variables: ['a'] }], ['a', 'a'])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const expression2 = { coefficients: [6, 7], variables: ['a'] }
			const expression3 = { coefficients: [6, 7], variables: ['b'] }

			const applied1 = addPolynomials([expression1, expression2])
			expect(comparePolynomialCoefficients(applied1.coefficients, [[8, 3], [11, 5]])).toBe(true)
			expect(applied1.variables).toEqual(expect.arrayContaining(expression1.variables))

			const applied2 = addPolynomials([expression1, expression3])
			expect(comparePolynomialCoefficients(applied2.coefficients, [[8, 10], [4, 5]])).toBe(true)
			expect(applied2.variables).toEqual(expect.arrayContaining(expression1.variables))
		})
	})

	describe('multiplyPolynomials', () => {
		it('rejects an empty expression list', () => {
			// @ts-expect-error Verify the runtime guard for untyped JavaScript consumers.
			expect(() => multiplyPolynomials([])).toThrow(RangeError)
		})

		it('rejects duplicate destination variables', () => {
			expect(() => multiplyPolynomials([{ coefficients: [1, 2], variables: ['a'] }], ['a', 'a'])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const expression2 = { coefficients: [6, 7], variables: ['a'] }
			const expression3 = { coefficients: [6, 7], variables: ['b'] }

			const applied1 = multiplyPolynomials([expression1, expression2])
			expect(comparePolynomialCoefficients(applied1.coefficients, [[12, 18], [38, 51], [28, 35]])).toBe(true)
			expect(applied1.variables).toEqual(expect.arrayContaining(expression1.variables))

			const applied2 = multiplyPolynomials([expression1, expression3])
			expect(comparePolynomialCoefficients(applied2.coefficients, [[12, 32, 21], [24, 58, 35]])).toBe(true)
			expect(applied2.variables).toEqual(expect.arrayContaining(expression1.variables))
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
		it('works for a polynomial without variables', () => {
			expect(raisePolynomialToPower({ coefficients: 2, variables: [] }, 3)).toEqual({ coefficients: 8, variables: [] })
		})

		it('works correctly for a single variable', () => {
			const expression = { coefficients: [6, 7], variables: ['a'] }
			const applied = raisePolynomialToPower(expression, 3)
			expect(comparePolynomialCoefficients(applied.coefficients, [6 ** 3, 3 * 6 ** 2 * 7, 3 * 6 * 7 ** 2, 7 ** 3])).toBe(true)
			expect(applied.variables).toEqual(expect.arrayContaining(expression.variables))
		})
		
		it('works correctly for two variables', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = raisePolynomialToPower(expression, 2)
			expect(comparePolynomialCoefficients(applied.coefficients, [[2 ** 2, 2 * 2 * 3, 3 ** 2], [2 * 2 * 4, 2 * 2 * 5 + 2 * 3 * 4, 2 * 3 * 5], [4 ** 2, 2 * 4 * 5, 5 ** 2]])).toBe(true)
			expect(applied.variables).toEqual(expect.arrayContaining(expression.variables))
		})
	})
})
