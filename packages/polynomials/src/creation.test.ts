import { describe, expect, it } from 'vitest'

import { createConstantPolynomial, createPolynomial } from './creation.ts'

describe('polynomial creation', () => {
	it('creates canonical polynomials', () => {
		expect(createPolynomial([
			{ coefficient: 3, exponents: [1] },
			{ coefficient: 2, exponents: [0] },
		], ['x'])).toEqual({
			terms: [{ coefficient: 2, exponents: [0] }, { coefficient: 3, exponents: [1] }],
			variables: ['x'],
		})
		expect(createConstantPolynomial(5)).toEqual({ terms: [{ coefficient: 5, exponents: [] }], variables: [] })
		expect(createConstantPolynomial(0)).toEqual({ terms: [], variables: [] })
	})

	it('combines duplicate terms and removes exact zeroes', () => {
		expect(createPolynomial([
			{ coefficient: 2, exponents: [3] },
			{ coefficient: -2, exponents: [3] },
			{ coefficient: 0, exponents: [1] },
		], ['x'])).toEqual({ terms: [], variables: ['x'] })
	})

	it('rejects invalid input', () => {
		expect(() => createPolynomial([{ coefficient: 2, exponents: [] }], ['x'])).toThrow()
		expect(() => createPolynomial([{ coefficient: Number.NaN, exponents: [0] }], ['x'])).toThrow()
		expect(() => createConstantPolynomial(Number.NaN)).toThrow()
	})
})
