import { describe, expect, it } from 'vitest'

import { ensurePolynomial, ensurePolynomialVariables } from './checks.ts'

describe('ensurePolynomialVariables', () => {
	it('accepts valid variable lists', () => {
		const list = ['a', 'b']
		expect(ensurePolynomialVariables(list)).toBe(list)
		expect(ensurePolynomialVariables([])).toEqual([])
	})

	it.each([
		'a',
		['a', 2],
		[''],
		['a', 'a'],
	])('rejects invalid input %#', value => {
		expect(() => ensurePolynomialVariables(value)).toThrow()
	})
})

describe('ensurePolynomial', () => {
	it('accepts valid constant and multivariable polynomials', () => {
		const constant = { coefficients: 5, variables: [] }
		expect(ensurePolynomial(constant)).toBe(constant)
		expect(() => ensurePolynomial({ coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] })).not.toThrow()
	})

	it.each([
		undefined,
		null,
		5,
		[],
		{},
		{ coefficients: [1, Number.NaN], variables: ['x'] },
		{ coefficients: [1, Number.POSITIVE_INFINITY], variables: ['x'] },
		{ coefficients: [[1], [2, 3]], variables: ['x', 'y'] },
		{ coefficients: [1, 2], variables: [] },
		{ coefficients: [], variables: ['x'] },
	])('rejects invalid input %#', value => {
		expect(() => ensurePolynomial(value)).toThrow()
	})
})
