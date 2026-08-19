import { describe, expect, it } from 'vitest'

import { binomialCoefficient, factorial, factorialRatio } from './combinatorics'

describe('factorial', () => {
	it('calculates known factorials', () => {
		expect(factorial(0)).toBe(1)
		expect(factorial(1)).toBe(1)
		expect(factorial(5)).toBe(120)
		expect(factorial(10)).toBe(3628800)
	})

	it('supports repeated and out-of-order calls', () => {
		expect(factorial(12)).toBe(479001600)
		expect(factorial(6)).toBe(720)
		expect(factorial(12)).toBe(479001600)
	})

	it('returns infinity when the result exceeds the number range', () => {
		expect(factorial(171)).toBe(Infinity)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity])('rejects invalid input %s', n => {
		expect(() => factorial(n)).toThrow()
	})
})

describe('factorialRatio', () => {
	it('uses factorial semantics for denominators zero and one', () => {
		expect(factorialRatio(6, 0)).toBe(factorial(6))
		expect(factorialRatio(6, 1)).toBe(factorial(6))
	})

	it('calculates known factorial ratios', () => {
		expect(factorialRatio(5, 5)).toBe(1)
		expect(factorialRatio(5, 3)).toBe(20)
		expect(factorialRatio(10, 6)).toBe(5040)
	})

	it('supports repeated calls and finite ratios above the factorial overflow threshold', () => {
		const ratio = 200 * 199 * 198 * 197 * 196
		expect(factorialRatio(200, 195)).toBe(ratio)
		expect(factorialRatio(200, 195)).toBe(ratio)
		expect(factorial(200)).toBe(Infinity)
	})

	it('rejects a numerator smaller than the denominator', () => {
		expect(() => factorialRatio(3, 4)).toThrow(RangeError)
	})

	it.each([[-1, 0], [4, -1], [4.5, 2], [4, 2.5], [Number.MAX_SAFE_INTEGER + 1, 2], [4, Infinity]])('rejects invalid inputs %s and %s', (n, denominator) => {
		expect(() => factorialRatio(n, denominator)).toThrow()
	})
})

describe('binomialCoefficient', () => {
	it('handles boundary cases', () => {
		expect(binomialCoefficient(0, 0)).toBe(1)
		expect(binomialCoefficient(8, 0)).toBe(1)
		expect(binomialCoefficient(8, 8)).toBe(1)
	})

	it('calculates known coefficients', () => {
		expect(binomialCoefficient(5, 2)).toBe(10)
		expect(binomialCoefficient(10, 4)).toBe(210)
		expect(binomialCoefficient(52, 5)).toBe(2598960)
	})

	it('is symmetric and supports repeated calls', () => {
		expect(binomialCoefficient(20, 3)).toBe(binomialCoefficient(20, 17))
		expect(binomialCoefficient(20, 3)).toBe(1140)
	})

	it('calculates large finite coefficients without factorial overflow', () => {
		expect(binomialCoefficient(1000, 2)).toBe(499500)
	})

	it('rejects k greater than n', () => {
		expect(() => binomialCoefficient(3, 4)).toThrow(RangeError)
	})

	it.each([[-1, 0], [4, -1], [4.5, 2], [4, 2.5], [Number.MAX_SAFE_INTEGER + 1, 2], [4, Infinity]])('rejects invalid inputs %s and %s', (n, k) => {
		expect(() => binomialCoefficient(n, k)).toThrow()
	})
})
