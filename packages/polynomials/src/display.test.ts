import { describe, expect, it } from 'vitest'

import { polynomialToString } from './display'

describe('polynomialToString', () => {
	it.each([
		[{ coefficients: 0, variables: [] }, '0'],
		[{ coefficients: 5, variables: [] }, '5'],
		[{ coefficients: [0, 1], variables: ['x'] }, 'x'],
		[{ coefficients: [0, -1], variables: ['x'] }, '-x'],
		[{ coefficients: [1, 0, 2], variables: ['x'] }, '1+2*x^2'],
		[{ coefficients: [[2, 3], [4, 5]], variables: ['a', 'b'] }, '2+3*b+4*a+5*a*b'],
	] as const)('displays %# as %s', (polynomial, expected) => {
		expect(polynomialToString(polynomial)).toBe(expected)
	})
})
