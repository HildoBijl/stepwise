import { describe, expect, it } from 'vitest'

import { polynomialToString } from './display.ts'

describe('polynomialToString', () => {
	it.each([
		[{ terms: [], variables: [] }, '0'],
		[{ terms: [{ coefficient: 5, exponents: [] }], variables: [] }, '5'],
		[{ terms: [{ coefficient: 1, exponents: [1] }], variables: ['x'] }, 'x'],
		[{ terms: [{ coefficient: -1, exponents: [1] }], variables: ['x'] }, '-x'],
		[{ terms: [{ coefficient: 1, exponents: [0] }, { coefficient: 2, exponents: [2] }], variables: ['x'] }, '1+2*x^2'],
		[{
			terms: [
				{ coefficient: 2, exponents: [0, 0] },
				{ coefficient: 3, exponents: [0, 1] },
				{ coefficient: 4, exponents: [1, 0] },
				{ coefficient: 5, exponents: [1, 1] },
			],
			variables: ['a', 'b'],
		}, '2+3*b+4*a+5*a*b'],
	] as const)('displays %# as %s', (polynomial, expected) => {
		expect(polynomialToString(polynomial)).toBe(expected)
	})
})
