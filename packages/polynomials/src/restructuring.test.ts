import { compareNumberArrays } from '@step-wise/utils'

import { PolynomialExpression } from './types'
import { restructurePolynomial, substituteIntoPolynomial } from './restructuring'

describe('Check restructure/substitute functions:', () => {
	describe('restructurePolynomial', () => {
		it('works correctly on equally sized lists', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const newList = ['b', 'a']
			const applied = restructurePolynomial(expression, newList)
			const result = [[2, 4], [3, 5]]
			expect(compareNumberArrays(applied.matrix, result)).toBe(true)
			expect(applied.list).toEqual(newList)
		})

		it('works correctly on unequally sized lists', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const newList = ['c', 'b', 'a']
			const applied = restructurePolynomial(expression, newList)
			const result = [[[2, 4], [3, 5]]]
			expect(compareNumberArrays(applied.matrix, result)).toBe(true)
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
			const applied = substituteIntoPolynomial(expression, { a: 3 }) as PolynomialExpression
			const result = [14, 18]
			expect(applied.list).toEqual(['b'])
			expect(compareNumberArrays(applied.matrix, result)).toBe(true)
		})

		it('works correctly when substituting all variables', () => {
			const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
			const applied = substituteIntoPolynomial(expression, { a: 3, b: 2 }) as number
			expect(applied).toBe(50)
		})
	})
})
