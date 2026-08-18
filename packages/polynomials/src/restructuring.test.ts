import { describe, expect, it } from 'vitest'

import { comparePolynomialMatrices } from './comparison'
import { restructurePolynomial, substituteIntoPolynomial } from './restructuring'

describe('Check restructure/substitute functions:', () => {
	describe('restructurePolynomial', () => {
		it('works correctly on equally sized lists', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const newList = ['b', 'a']
			const applied = restructurePolynomial(expression, newList)
			const result = [[2, 4], [3, 5]]
			expect(comparePolynomialMatrices(applied.matrix, result)).toBe(true)
			expect(applied.list).toEqual(newList)
		})

		it('works correctly on unequally sized lists', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const newList = ['c', 'b', 'a']
			const applied = restructurePolynomial(expression, newList)
			const result = [[[2, 4], [3, 5]]]
			expect(comparePolynomialMatrices(applied.matrix, result)).toBe(true)
			expect(applied.list).toEqual(newList)
		})

		it('throws an error when existing variables are dropped', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const newList = ['b', 'c']
			expect(() => restructurePolynomial(expression, newList)).toThrow()
		})

		it('allows dropping of non-present variables', () => {
			const expression = { matrix: [[2, 3]], list: ['a', 'b'] }
			const newList = ['b', 'c']
			expect(() => restructurePolynomial(expression, newList)).not.toThrow()
		})
	})

	describe('substituteIntoPolynomial', () => {
		it('works correctly when substituting part of the variables', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = substituteIntoPolynomial(expression, { a: 3 })
			expect(applied.list).toEqual(['b'])
			expect(comparePolynomialMatrices(applied.matrix, [14, 18])).toBe(true)
			const applied2 = substituteIntoPolynomial(expression, { b: 3 })
			expect(applied2.list).toEqual(['a'])
			expect(comparePolynomialMatrices(applied2.matrix, [11, 19])).toBe(true)
			const applied3 = substituteIntoPolynomial(expression, { unused: 2, b: 3 })
			expect(applied3.list).toEqual(['a'])
			expect(comparePolynomialMatrices(applied3.matrix, [11, 19])).toBe(true)
		})

		it('works correctly when substituting all variables', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			expect(substituteIntoPolynomial(expression, { a: 3, b: 2 })).toEqual({ matrix: 50, list: [] })
			expect(substituteIntoPolynomial(expression, { b: 2, a: 3 })).toEqual({ matrix: 50, list: [] })
			expect(substituteIntoPolynomial(expression, { a: 2, b: 3 })).toEqual({ matrix: 49, list: [] })
		})
	})
})
