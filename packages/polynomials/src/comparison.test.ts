import { describe, expect, it } from 'vitest'

import { comparePolynomialExpressions, comparePolynomialMatrices } from './comparison'

describe('comparePolynomialMatrices', () => {
	it('compares scalar and nested polynomial matrices', () => {
		expect(comparePolynomialMatrices(2, 2)).toBe(true)
		expect(comparePolynomialMatrices([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true)
	})

	it('rejects different values, shapes and nesting depths', () => {
		expect(comparePolynomialMatrices(2, 3)).toBe(false)
		expect(comparePolynomialMatrices(2, [2])).toBe(false)
		expect(comparePolynomialMatrices([1, 2], [1, 2, 3])).toBe(false)
	})
})

describe('comparePolynomialExpressions', () => {
	const expression = { matrix: [[2, 3], [4, 5]], list: ['a', 'b'] }
	const reorderedExpression = { matrix: [[2, 4], [3, 5]], list: ['b', 'a'] }

	it('allows different variable orders by default', () => {
		expect(comparePolynomialExpressions(expression, reorderedExpression)).toBe(true)
	})

	it('can require the same variable order', () => {
		expect(comparePolynomialExpressions(expression, reorderedExpression, false)).toBe(false)
		expect(comparePolynomialExpressions(expression, expression, false)).toBe(true)
	})

	it('rejects expressions with different variables or coefficients', () => {
		expect(comparePolynomialExpressions(expression, { matrix: [[2, 3], [4, 5]], list: ['a', 'c'] })).toBe(false)
		expect(comparePolynomialExpressions(expression, { matrix: [[2, 3], [4, 6]], list: ['a', 'b'] })).toBe(false)
	})
})
