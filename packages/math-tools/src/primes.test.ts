import { describe, expect, it } from 'vitest'

import { getPrimeByIndex, getPrimeFactorization, isPrime } from './primes.ts'

describe('getPrimeByIndex', () => {
	it('returns known primes by their zero-based index', () => {
		expect([0, 1, 2, 5, 10].map(getPrimeByIndex)).toEqual([2, 3, 5, 13, 31])
	})

	it('supports repeated and out-of-order requests', () => {
		expect(getPrimeByIndex(20)).toBe(73)
		expect(getPrimeByIndex(3)).toBe(7)
		expect(getPrimeByIndex(20)).toBe(73)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, Infinity])('rejects invalid index %s', index => {
		expect(() => getPrimeByIndex(index)).toThrow()
	})
})

describe('isPrime', () => {
	it.each([2, 3, 5, 97, 7919])('recognizes prime number %s', number => {
		expect(isPrime(number)).toBe(true)
	})

	it.each([1, 4, 9, 25, 100, 7920])('rejects composite or non-prime number %s', number => {
		expect(isPrime(number)).toBe(false)
	})

	it.each([0, -2, 2.5, Number.MAX_SAFE_INTEGER + 1, Infinity])('rejects invalid input %s', number => {
		expect(() => isPrime(number)).toThrow()
	})
})

describe('getPrimeFactorization', () => {
	it('returns an empty factorization for one', () => {
		expect(getPrimeFactorization(1)).toEqual([])
	})

	it('factorizes primes, prime powers, and mixed composites', () => {
		expect(getPrimeFactorization(29)).toEqual([{ prime: 29, exponent: 1 }])
		expect(getPrimeFactorization(2 ** 8)).toEqual([{ prime: 2, exponent: 8 }])
		expect(getPrimeFactorization(2 ** 3 * 3 ** 2 * 17)).toEqual([{ prime: 2, exponent: 3 }, { prime: 3, exponent: 2 }, { prime: 17, exponent: 1 }])
	})

	it.each([0, -1, 2.5, Number.MAX_SAFE_INTEGER + 1, Infinity])('rejects invalid input %s', number => {
		expect(() => getPrimeFactorization(number)).toThrow()
	})
})
