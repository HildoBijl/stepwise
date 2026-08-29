import { describe, expect, it } from 'vitest'

import type { PolynomialVariable } from './types.ts'
import { alignPolynomialVariables, evaluatePolynomial, substitutePolynomial, substitutePolynomialMoments } from './restructuring.ts'

const polynomial = {
	terms: [
		{ coefficient: 2, exponents: [0, 0] },
		{ coefficient: 3, exponents: [0, 1] },
		{ coefficient: 4, exponents: [1, 0] },
		{ coefficient: 5, exponents: [1, 1] },
	],
	variables: ['a', 'b'],
}

describe('alignPolynomialVariables', () => {
	it('reorders variables and adds inactive variables', () => {
		expect(alignPolynomialVariables(polynomial, ['c', 'b', 'a'])).toEqual({
			terms: [
				{ coefficient: 2, exponents: [0, 0, 0] },
				{ coefficient: 4, exponents: [0, 0, 1] },
				{ coefficient: 3, exponents: [0, 1, 0] },
				{ coefficient: 5, exponents: [0, 1, 1] },
			],
			variables: ['c', 'b', 'a'],
		})
	})

	it('rejects dropping an active variable', () => {
		expect(() => alignPolynomialVariables(polynomial, ['b', 'c'])).toThrow()
	})

	it('allows dropping an inactive variable', () => {
		const withInactiveVariable = { terms: [{ coefficient: 2, exponents: [0, 1] }], variables: ['a', 'b'] }
		expect(alignPolynomialVariables(withInactiveVariable, ['b'])).toEqual({ terms: [{ coefficient: 2, exponents: [1] }], variables: ['b'] })
	})

	it('rejects duplicate destination variables', () => {
		expect(() => alignPolynomialVariables(polynomial, ['a', 'a'])).toThrow(RangeError)
	})

	it('adds variables to a constant polynomial', () => {
		expect(alignPolynomialVariables({ terms: [{ coefficient: 5, exponents: [] }], variables: [] }, ['x'])).toEqual({ terms: [{ coefficient: 5, exponents: [0] }], variables: ['x'] })
	})
})

describe('substitutePolynomial', () => {
	it('substitutes part of the variables and combines resulting terms', () => {
		expect(substitutePolynomial(polynomial, { a: 3 })).toEqual({
			terms: [{ coefficient: 14, exponents: [0] }, { coefficient: 18, exponents: [1] }],
			variables: ['b'],
		})
		expect(substitutePolynomial(polynomial, { unused: 2, b: 3 })).toEqual({
			terms: [{ coefficient: 11, exponents: [0] }, { coefficient: 19, exponents: [1] }],
			variables: ['a'],
		})
	})

	it('produces a constant polynomial when substituting all variables', () => {
		expect(substitutePolynomial(polynomial, { a: 3, b: 2 })).toEqual({ terms: [{ coefficient: 50, exponents: [] }], variables: [] })
	})
})

describe('evaluatePolynomial', () => {
	it('returns the value when all variables are provided', () => {
		expect(evaluatePolynomial(polynomial, { a: 3, b: 2 })).toBe(50)
		expect(evaluatePolynomial({ terms: [], variables: ['x'] }, { x: 4 })).toBe(0)
	})

	it('rejects missing and non-finite values', () => {
		expect(() => evaluatePolynomial(polynomial, { a: 3 })).toThrow()
		expect(() => evaluatePolynomial(polynomial, { a: Number.NaN, b: 2 })).toThrow()
	})
})

describe('substitutePolynomialMoments', () => {
	it('uses the requested variables and caches moments', () => {
		const values: Record<PolynomialVariable, number> = { b: 2, a: 3 }
		const calls: string[] = []
		const getMoment = (variable: PolynomialVariable, exponent: number) => {
			calls.push(`${variable}:${exponent}`)
			return values[variable] ** exponent
		}
		expect(substitutePolynomialMoments(polynomial, getMoment, ['b'])).toEqual({
			terms: [{ coefficient: 8, exponents: [0] }, { coefficient: 14, exponents: [1] }],
			variables: ['a'],
		})
		expect(new Set(calls)).toEqual(new Set(['b:0', 'b:1']))
		expect(calls).toHaveLength(2)
	})

	it('rejects duplicate variables and invalid moments', () => {
		expect(() => substitutePolynomialMoments(polynomial, () => 1, ['a', 'a'])).toThrow(RangeError)
		expect(() => substitutePolynomialMoments(polynomial, () => Number.NaN, ['a'])).toThrow()
	})
})
