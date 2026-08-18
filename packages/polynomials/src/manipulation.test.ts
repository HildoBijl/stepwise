import { describe, expect, it } from 'vitest'

import { comparePolynomialMatrices } from './comparison'
import { applyMinusToPolynomial, addConstantToPolynomial, multiplyPolynomialByConstant, oneMinusPolynomial, addPolynomials, multiplyPolynomials, polynomialToPower } from './manipulation'

describe('Check mathematical functions:', () => {
	describe('applyMinusToPolynomial', () => {
		it('works correctly', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = applyMinusToPolynomial(expression)
			expect(comparePolynomialMatrices(applied.matrix, [[-2, -3], [-4, -5]])).toBe(true)
			expect(applied.list).toEqual(expression.list)
		})
	})

	describe('addConstantToPolynomial', () => {
		it('works correctly', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = addConstantToPolynomial(expression, 6)
			expect(comparePolynomialMatrices(applied.matrix, [[8, 3], [4, 5]])).toBe(true)
			expect(applied.list).toEqual(expression.list)
		})

		it('works on a polynomial without variables', () => {
			expect(addConstantToPolynomial({ matrix: 2, list: [] }, 3)).toEqual({ matrix: 5, list: [] })
		})
	})

	describe('multiplyPolynomialByConstant', () => {
		it('works correctly', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = multiplyPolynomialByConstant(expression, 3)
			expect(comparePolynomialMatrices(applied.matrix, [[6, 9], [12, 15]])).toBe(true)
			expect(applied.list).toEqual(expression.list)
		})

		it('works on a polynomial without variables', () => {
			expect(multiplyPolynomialByConstant({ matrix: 2, list: [] }, 3)).toEqual({ matrix: 6, list: [] })
		})
	})

	describe('oneMinusPolynomial', () => {
		it('works correctly', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = oneMinusPolynomial(expression)
			expect(comparePolynomialMatrices(applied.matrix, [[-1, -3], [-4, -5]])).toBe(true)
			expect(applied.list).toEqual(expression.list)
		})
	})

	describe('addPolynomials', () => {
		it('rejects an empty expression list', () => {
			// @ts-expect-error Verify the runtime guard for untyped JavaScript consumers.
			expect(() => addPolynomials([])).toThrow(RangeError)
		})

		it('rejects duplicate destination variables', () => {
			expect(() => addPolynomials([{ matrix: [1, 2], list: ['a'] }], ['a', 'a'])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const expression2 = { matrix: [6, 7], list: ['a'] }
			const expression3 = { matrix: [6, 7], list: ['b'] }

			const applied1 = addPolynomials([expression1, expression2])
			expect(comparePolynomialMatrices(applied1.matrix, [[8, 3], [11, 5]])).toBe(true)
			expect(applied1.list).toEqual(expect.arrayContaining(expression1.list))

			const applied2 = addPolynomials([expression1, expression3])
			expect(comparePolynomialMatrices(applied2.matrix, [[8, 10], [4, 5]])).toBe(true)
			expect(applied2.list).toEqual(expect.arrayContaining(expression1.list))
		})
	})

	describe('multiplyPolynomials', () => {
		it('rejects an empty expression list', () => {
			// @ts-expect-error Verify the runtime guard for untyped JavaScript consumers.
			expect(() => multiplyPolynomials([])).toThrow(RangeError)
		})

		it('rejects duplicate destination variables', () => {
			expect(() => multiplyPolynomials([{ matrix: [1, 2], list: ['a'] }], ['a', 'a'])).toThrow(RangeError)
		})

		it('works correctly', () => {
			const expression1 = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const expression2 = { matrix: [6, 7], list: ['a'] }
			const expression3 = { matrix: [6, 7], list: ['b'] }

			const applied1 = multiplyPolynomials([expression1, expression2])
			expect(comparePolynomialMatrices(applied1.matrix, [[12, 18], [38, 51], [28, 35]])).toBe(true)
			expect(applied1.list).toEqual(expect.arrayContaining(expression1.list))

			const applied2 = multiplyPolynomials([expression1, expression3])
			expect(comparePolynomialMatrices(applied2.matrix, [[12, 32, 21], [24, 58, 35]])).toBe(true)
			expect(applied2.list).toEqual(expect.arrayContaining(expression1.list))
		})
	})

	describe('polynomialToPower', () => {
		it('works for a polynomial without variables', () => {
			expect(polynomialToPower({ matrix: 2, list: [] }, 3)).toEqual({ matrix: 8, list: [] })
		})

		it('works correctly for a single variable', () => {
			const expression = { matrix: [6, 7], list: ['a'] }
			const applied = polynomialToPower(expression, 3)
			expect(comparePolynomialMatrices(applied.matrix, [6 ** 3, 3 * 6 ** 2 * 7, 3 * 6 * 7 ** 2, 7 ** 3])).toBe(true)
			expect(applied.list).toEqual(expect.arrayContaining(expression.list))
		})
		
		it('works correctly for two variables', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = polynomialToPower(expression, 2)
			expect(comparePolynomialMatrices(applied.matrix, [[2 ** 2, 2 * 2 * 3, 3 ** 2], [2 * 2 * 4, 2 * 2 * 5 + 2 * 3 * 4, 2 * 3 * 5], [4 ** 2, 2 * 4 * 5, 5 ** 2]])).toBe(true)
			expect(applied.list).toEqual(expect.arrayContaining(expression.list))
		})
	})
})
