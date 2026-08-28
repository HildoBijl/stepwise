import { describe, expect, it } from 'vitest'

import { comparePolynomials, comparePolynomialCoefficients } from './comparison.ts'

describe('comparePolynomialCoefficients', () => {
	it('compares scalar and nested polynomial matrices', () => {
		expect(comparePolynomialCoefficients(2, 2)).toBe(true)
		expect(comparePolynomialCoefficients([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true)
	})

	it('rejects different values, shapes and nesting depths', () => {
		expect(comparePolynomialCoefficients(2, 3)).toBe(false)
		expect(comparePolynomialCoefficients(2, [2])).toBe(false)
		expect(comparePolynomialCoefficients([1, 2], [1, 2, 3])).toBe(false)
	})
})

describe('comparePolynomials', () => {
	const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
	const reorderedExpression = { coefficients: [[2, 4], [3, 5]], variables: ['b', 'a'] }

	it('allows different variable orders by default', () => {
		expect(comparePolynomials(expression, reorderedExpression)).toBe(true)
	})

	it('can require the same variable order', () => {
		expect(comparePolynomials(expression, reorderedExpression, { allowVariableReordering: false })).toBe(false)
		expect(comparePolynomials(expression, expression, { allowVariableReordering: false })).toBe(true)
	})

	it('rejects expressions with different variables or coefficients', () => {
		expect(comparePolynomials(expression, { coefficients: [[2, 3], [4, 5]], variables: ['a', 'c'] })).toBe(false)
		expect(comparePolynomials(expression, { coefficients: [[2, 3], [4, 6]], variables: ['a', 'b'] })).toBe(false)
	})
})
