import { describe, expect, it } from 'vitest'

import { addConstantToPolynomial, addPolynomials, getPolynomialPowers, multiplyPolynomials, negatePolynomial, oneMinusPolynomial, raisePolynomialToPower, scalePolynomial, subtractPolynomials } from './manipulation.ts'

const polynomial = {
	terms: [
		{ coefficient: 2, exponents: [0, 0] },
		{ coefficient: 3, exponents: [0, 1] },
		{ coefficient: 4, exponents: [1, 0] },
		{ coefficient: 5, exponents: [1, 1] },
	],
	variables: ['a', 'b'],
}

describe('basic manipulation', () => {
	it('negates, scales and adds constants', () => {
		expect(negatePolynomial(polynomial).terms.map(term => term.coefficient)).toEqual([-2, -3, -4, -5])
		expect(scalePolynomial(polynomial, 3).terms.map(term => term.coefficient)).toEqual([6, 9, 12, 15])
		expect(addConstantToPolynomial(polynomial, 6).terms[0]).toEqual({ coefficient: 8, exponents: [0, 0] })
	})

	it('removes terms when scaling by zero', () => {
		expect(scalePolynomial(polynomial, 0)).toEqual({ terms: [], variables: ['a', 'b'] })
	})

	it('calculates one minus a polynomial', () => {
		expect(oneMinusPolynomial(polynomial).terms.map(term => term.coefficient)).toEqual([-1, -3, -4, -5])
	})

	it('rejects invalid numeric arguments', () => {
		expect(() => addConstantToPolynomial(polynomial, Number.NaN)).toThrow()
		expect(() => scalePolynomial(polynomial, Number.POSITIVE_INFINITY)).toThrow()
	})
})

describe('addition and subtraction', () => {
	it('rejects an empty polynomial list', () => {
		expect(() => addPolynomials([])).toThrow(RangeError)
	})

	it('aligns variables and combines matching terms', () => {
		const other = { terms: [{ coefficient: 6, exponents: [0] }, { coefficient: 7, exponents: [1] }], variables: ['a'] }
		expect(addPolynomials([polynomial, other])).toEqual({
			terms: [
				{ coefficient: 8, exponents: [0, 0] },
				{ coefficient: 3, exponents: [0, 1] },
				{ coefficient: 11, exponents: [1, 0] },
				{ coefficient: 5, exponents: [1, 1] },
			],
			variables: ['a', 'b'],
		})
	})

	it('subtracts polynomials with different variable sets', () => {
		const result = subtractPolynomials(
			{ terms: [{ coefficient: 2, exponents: [0] }, { coefficient: 3, exponents: [1] }], variables: ['a'] },
			{ terms: [{ coefficient: 1, exponents: [0] }, { coefficient: 4, exponents: [1] }], variables: ['b'] },
		)
		expect(result).toEqual({
			terms: [{ coefficient: 1, exponents: [0, 0] }, { coefficient: -4, exponents: [0, 1] }, { coefficient: 3, exponents: [1, 0] }],
			variables: ['a', 'b'],
		})
	})
})

describe('multiplication and powers', () => {
	it('rejects an empty polynomial list', () => {
		expect(() => multiplyPolynomials([])).toThrow(RangeError)
	})

	it('multiplies sparse terms and combines matching products', () => {
		const first = { terms: [{ coefficient: 2, exponents: [0] }, { coefficient: 3, exponents: [1] }], variables: ['x'] }
		const second = { terms: [{ coefficient: 4, exponents: [0] }, { coefficient: 5, exponents: [1] }], variables: ['x'] }
		expect(multiplyPolynomials([first, second])).toEqual({
			terms: [{ coefficient: 8, exponents: [0] }, { coefficient: 22, exponents: [1] }, { coefficient: 15, exponents: [2] }],
			variables: ['x'],
		})
	})

	it('returns the identity for exponent zero and expands powers', () => {
		const expression = { terms: [{ coefficient: 1, exponents: [0] }, { coefficient: 1, exponents: [1] }], variables: ['x'] }
		expect(raisePolynomialToPower(expression, 0)).toEqual({ terms: [{ coefficient: 1, exponents: [0] }], variables: ['x'] })
		expect(raisePolynomialToPower(expression, 3)).toEqual({
			terms: [{ coefficient: 1, exponents: [0] }, { coefficient: 3, exponents: [1] }, { coefficient: 3, exponents: [2] }, { coefficient: 1, exponents: [3] }],
			variables: ['x'],
		})
	})

	it('returns every power through the requested maximum', () => {
		const expression = { terms: [{ coefficient: 1, exponents: [1] }], variables: ['x'] }
		expect(getPolynomialPowers(expression, 3)).toEqual([
			{ terms: [{ coefficient: 1, exponents: [0] }], variables: ['x'] },
			{ terms: [{ coefficient: 1, exponents: [1] }], variables: ['x'] },
			{ terms: [{ coefficient: 1, exponents: [2] }], variables: ['x'] },
			{ terms: [{ coefficient: 1, exponents: [3] }], variables: ['x'] },
		])
	})

	it.each([-1, 1.5, Number.NaN])('rejects invalid exponent %s', exponent => {
		expect(() => raisePolynomialToPower({ terms: [{ coefficient: 1, exponents: [1] }], variables: ['x'] }, exponent)).toThrow()
	})
})
