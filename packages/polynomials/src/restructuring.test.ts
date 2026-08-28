import { describe, expect, it } from 'vitest'

import { comparePolynomialCoefficients } from './comparison.ts'
import { alignPolynomialVariables, evaluatePolynomial, substitutePolynomial, substitutePolynomialMoments } from './restructuring.ts'

describe('Check restructure/substitute functions:', () => {
	describe('alignPolynomialVariables', () => {
		it('works correctly on equally sized lists', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const newList = ['b', 'a']
			const applied = alignPolynomialVariables(expression, newList)
			const result = [[2, 4], [3, 5]]
			expect(comparePolynomialCoefficients(applied.coefficients, result)).toBe(true)
			expect(applied.variables).toEqual(newList)
		})

		it('works correctly on unequally sized lists', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const newList = ['c', 'b', 'a']
			const applied = alignPolynomialVariables(expression, newList)
			const result = [[[2, 4], [3, 5]]]
			expect(comparePolynomialCoefficients(applied.coefficients, result)).toBe(true)
			expect(applied.variables).toEqual(newList)
		})

		it('throws an error when existing variables are dropped', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const newList = ['b', 'c']
			expect(() => alignPolynomialVariables(expression, newList)).toThrow()
		})

		it('allows dropping of non-present variables', () => {
			const expression = { coefficients: [[2, 3]], variables: ['a', 'b'] }
			const newList = ['b', 'c']
			expect(() => alignPolynomialVariables(expression, newList)).not.toThrow()
		})

		it('rejects duplicate destination variables', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			expect(() => alignPolynomialVariables(expression, ['a', 'a'])).toThrow(RangeError)
		})

		it('adds variables to a constant polynomial', () => {
			expect(alignPolynomialVariables({ coefficients: 5, variables: [] }, ['x'])).toEqual({ coefficients: [5], variables: ['x'] })
		})
	})

	describe('substitutePolynomial', () => {
		it('works correctly when substituting part of the variables', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied1 = substitutePolynomial(expression, { a: 3 })
			expect(applied1.variables).toEqual(['b'])
			expect(comparePolynomialCoefficients(applied1.coefficients, [14, 18])).toBe(true)
			const applied2 = substitutePolynomial(expression, { b: 3 })
			expect(applied2.variables).toEqual(['a'])
			expect(comparePolynomialCoefficients(applied2.coefficients, [11, 19])).toBe(true)
			const applied3 = substitutePolynomial(expression, { unused: 2, b: 3 })
			expect(applied3.variables).toEqual(['a'])
			expect(comparePolynomialCoefficients(applied3.coefficients, [11, 19])).toBe(true)
		})

		it('works correctly when substituting all variables', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			expect(substitutePolynomial(expression, { a: 3, b: 2 })).toEqual({ coefficients: 50, variables: [] })
			expect(substitutePolynomial(expression, { b: 2, a: 3 })).toEqual({ coefficients: 50, variables: [] })
		})
	})

	describe('evaluatePolynomial', () => {
		it('returns the value when all variables are provided', () => {
			expect(evaluatePolynomial({ coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }, { a: 3, b: 2 })).toBe(50)
		})

		it('rejects missing and non-finite values', () => {
			const polynomial = { coefficients: [2, 3], variables: ['a'] }
			expect(() => evaluatePolynomial(polynomial, {})).toThrow()
			expect(() => evaluatePolynomial(polynomial, { a: Number.NaN })).toThrow()
		})
	})

	describe('moment substitution', () => {
		const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }

		it('uses variablesToSubstitute order for individual moments', () => {
			const values: Record<string, number> = { b: 2, a: 3 }
			const getIndividualMoment = (variable: string, exponent: number) => values[variable] ** exponent
			expect(substitutePolynomialMoments(expression, getIndividualMoment, ['b', 'a'])).toEqual({ coefficients: 50, variables: [] })
			expect(substitutePolynomialMoments(expression, getIndividualMoment, ['b'])).toEqual({ coefficients: [8, 14], variables: ['a'] })
		})

		it('rejects duplicate substitution variables', () => {
			expect(() => substitutePolynomialMoments(expression, () => 1, ['a', 'a'])).toThrow(RangeError)
		})

		it('rejects invalid moments', () => {
			expect(() => substitutePolynomialMoments(expression, () => Number.NaN, ['a'])).toThrow()
		})
	})
})
