import { describe, expect, it } from 'vitest'

import { comparePolynomialCoefficients } from './comparison'
import { alignPolynomialVariables, evaluatePolynomial, substitutePolynomialIndividualMoments, substitutePolynomial, substitutePolynomialMoments } from './restructuring'

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
	})

	describe('substitutePolynomial', () => {
		it('works correctly when substituting part of the variables', () => {
			const expression = { coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }
			const applied = substitutePolynomial(expression, { a: 3 })
			expect(applied.variables).toEqual(['b'])
			expect(comparePolynomialCoefficients(applied.coefficients, [14, 18])).toBe(true)
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
			expect(substitutePolynomial(expression, { a: 2, b: 3 })).toEqual({ coefficients: 49, variables: [] })
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
			expect(substitutePolynomialIndividualMoments(expression, getIndividualMoment, ['b', 'a'])).toEqual({ coefficients: 50, variables: [] })
			expect(substitutePolynomialIndividualMoments(expression, getIndividualMoment, ['b'])).toEqual({ coefficients: [8, 14], variables: ['a'] })
		})

		it('uses variablesToSubstitute order for joint moments', () => {
			const getMoment = ([bExponent, aExponent]: number[]) => 2 ** bExponent * 3 ** aExponent
			expect(substitutePolynomialMoments(expression, getMoment, ['b', 'a'])).toEqual({ coefficients: 50, variables: [] })
		})

		it('rejects duplicate substitution variables', () => {
			expect(() => substitutePolynomialIndividualMoments(expression, () => 1, ['a', 'a'])).toThrow(RangeError)
			expect(() => substitutePolynomialMoments(expression, () => 1, ['a', 'a'])).toThrow(RangeError)
		})

		it('rejects invalid moments', () => {
			expect(() => substitutePolynomialIndividualMoments(expression, () => Number.NaN, ['a'])).toThrow()
			expect(() => substitutePolynomialMoments(expression, () => Number.POSITIVE_INFINITY, ['a'])).toThrow()
		})
	})
})
