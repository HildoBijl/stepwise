import { describe, expect, it } from 'vitest'

import { createConstantPolynomial, createPolynomial } from './creation.ts'

describe('polynomial creation', () => {
	it('creates validated polynomials', () => {
		expect(createPolynomial([2, 3], ['x'])).toEqual({ coefficients: [2, 3], variables: ['x'] })
		expect(createConstantPolynomial(5)).toEqual({ coefficients: 5, variables: [] })
	})

	it('rejects invalid input', () => {
		expect(() => createPolynomial([2, 3], [])).toThrow()
		expect(() => createConstantPolynomial(Number.NaN)).toThrow()
	})
})
