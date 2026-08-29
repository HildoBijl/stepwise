import { describe, expect, it } from 'vitest'

import { ensurePolynomial, ensurePolynomialExponents, ensurePolynomialTerm, ensurePolynomialVariables } from './checks.ts'

describe('ensurePolynomialVariables', () => {
	it('accepts valid variable lists', () => {
		const list = ['a', 'b']
		expect(ensurePolynomialVariables(list)).toBe(list)
		expect(ensurePolynomialVariables([])).toEqual([])
	})

	it.each(['a', ['a', 2], [''], ['a', 'a']])('rejects invalid input %#', value => {
		expect(() => ensurePolynomialVariables(value)).toThrow()
	})
})

describe('ensurePolynomialExponents', () => {
	it('accepts exponent vectors of the expected length', () => {
		const exponents = [0, 12]
		expect(ensurePolynomialExponents(exponents, 2)).toBe(exponents)
	})

	it.each([undefined, 2, [0], [0, 1, 2], [-1, 2], [1.5, 2], [Number.MAX_SAFE_INTEGER + 1, 2]])('rejects invalid input %#', value => {
		expect(() => ensurePolynomialExponents(value, 2)).toThrow()
	})

	it('rejects an invalid variable count', () => {
		expect(() => ensurePolynomialExponents([], -1)).toThrow()
		expect(() => ensurePolynomialExponents([], 1.5)).toThrow()
	})
})

describe('ensurePolynomialTerm', () => {
	it('accepts a finite non-zero coefficient and matching exponents', () => {
		const term = { coefficient: 2, exponents: [1, 3] }
		expect(ensurePolynomialTerm(term, 2)).toBe(term)
	})

	it.each([undefined, [], {}, { coefficient: 0, exponents: [1] }, { coefficient: Number.NaN, exponents: [1] }, { coefficient: 2, exponents: [] }])('rejects invalid input %#', value => {
		expect(() => ensurePolynomialTerm(value, 1)).toThrow()
	})
})

describe('ensurePolynomial', () => {
	it('accepts canonical zero, constant and multivariable polynomials', () => {
		const constant = { terms: [{ coefficient: 5, exponents: [] }], variables: [] }
		expect(ensurePolynomial(constant)).toBe(constant)
		expect(() => ensurePolynomial({ terms: [], variables: [] })).not.toThrow()
		expect(() => ensurePolynomial({
			terms: [{ coefficient: 2, exponents: [0, 0] }, { coefficient: 3, exponents: [0, 1] }, { coefficient: 4, exponents: [1, 0] }],
			variables: ['a', 'b'],
		})).not.toThrow()
	})

	it.each([
		undefined,
		null,
		5,
		[],
		{},
		{ terms: 'invalid', variables: ['x'] },
		{ terms: [{ coefficient: 1, exponents: [] }], variables: ['x'] },
		{ terms: [{ coefficient: 0, exponents: [0] }], variables: ['x'] },
		{ terms: [{ coefficient: 1, exponents: [0] }, { coefficient: 2, exponents: [0] }], variables: ['x'] },
		{ terms: [{ coefficient: 1, exponents: [1] }, { coefficient: 2, exponents: [0] }], variables: ['x'] },
	])('rejects invalid input %#', value => {
		expect(() => ensurePolynomial(value)).toThrow()
	})
})
