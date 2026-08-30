import { describe, expect, it } from 'vitest'

import { comparePolynomials, comparePolynomialTerms } from './comparison.ts'

describe('comparePolynomialTerms', () => {
	it('compares exponent vectors and approximately equal coefficients', () => {
		expect(comparePolynomialTerms(
			[{ coefficient: 2, exponents: [0] }, { coefficient: 3, exponents: [2] }],
			[{ coefficient: 2, exponents: [0] }, { coefficient: 3 + Number.EPSILON, exponents: [2] }],
		)).toBe(true)
	})

	it('rejects different coefficients, exponents and term counts', () => {
		expect(comparePolynomialTerms([{ coefficient: 2, exponents: [0] }], [{ coefficient: 3, exponents: [0] }])).toBe(false)
		expect(comparePolynomialTerms([{ coefficient: 2, exponents: [0] }], [{ coefficient: 2, exponents: [1] }])).toBe(false)
		expect(comparePolynomialTerms([{ coefficient: 2, exponents: [0] }], [])).toBe(false)
	})
})

describe('comparePolynomials', () => {
	const polynomial = {
		terms: [
			{ coefficient: 2, exponents: [0, 0] },
			{ coefficient: 3, exponents: [0, 1] },
			{ coefficient: 4, exponents: [1, 0] },
			{ coefficient: 5, exponents: [1, 1] },
		],
		variables: ['a', 'b'],
	}
	const reorderedPolynomial = {
		terms: [
			{ coefficient: 2, exponents: [0, 0] },
			{ coefficient: 4, exponents: [0, 1] },
			{ coefficient: 3, exponents: [1, 0] },
			{ coefficient: 5, exponents: [1, 1] },
		],
		variables: ['b', 'a'],
	}

	it('allows different variable orders by default', () => {
		expect(comparePolynomials(polynomial, reorderedPolynomial)).toBe(true)
	})

	it('can require the same variable order', () => {
		expect(comparePolynomials(polynomial, reorderedPolynomial, { allowVariableReordering: false })).toBe(false)
		expect(comparePolynomials(polynomial, polynomial, { allowVariableReordering: false })).toBe(true)
	})

	it('rejects polynomials with different variables or terms', () => {
		expect(comparePolynomials(polynomial, { ...polynomial, variables: ['a', 'c'] })).toBe(false)
		expect(comparePolynomials(polynomial, { ...polynomial, terms: [...polynomial.terms.slice(0, -1), { coefficient: 6, exponents: [1, 1] }] })).toBe(false)
	})
})
