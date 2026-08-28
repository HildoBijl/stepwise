import { describe, expect, it } from 'vitest'

import { getLargestPerfectPowerDivisor, isPerfectPower, isPerfectSquare } from './powers.ts'

describe('isPerfectPower', () => {
	it('handles exponents zero and one', () => {
		expect(isPerfectPower(1, 0)).toBe(true)
		expect(isPerfectPower(2, 0)).toBe(false)
		expect(isPerfectPower(-12, 1)).toBe(true)
	})

	it('recognizes positive perfect powers', () => {
		expect(isPerfectPower(0, 4)).toBe(true)
		expect(isPerfectPower(1, 7)).toBe(true)
		expect(isPerfectPower(64, 2)).toBe(true)
		expect(isPerfectPower(64, 3)).toBe(true)
		expect(isPerfectPower(72, 2)).toBe(false)
	})

	it('only recognizes negative powers with odd exponents', () => {
		expect(isPerfectPower(-125, 3)).toBe(true)
		expect(isPerfectPower(-64, 2)).toBe(false)
		expect(isPerfectPower(-72, 3)).toBe(false)
	})

	it.each([[2.5, 2], [4, -1], [4, 1.5], [Number.MAX_SAFE_INTEGER + 1, 2], [4, Infinity]])('rejects invalid inputs %s and %s', (number, exponent) => {
		expect(() => isPerfectPower(number, exponent)).toThrow()
	})
})

describe('isPerfectSquare', () => {
	it.each([0, 1, 4, 81, 144])('recognizes square %s', number => {
		expect(isPerfectSquare(number)).toBe(true)
	})

	it.each([2, 8, 80, -4])('rejects non-square %s', number => {
		expect(isPerfectSquare(number)).toBe(false)
	})

	it.each([2.5, Number.MAX_SAFE_INTEGER + 1, Infinity])('rejects invalid input %s', number => {
		expect(() => isPerfectSquare(number)).toThrow()
	})
})

describe('getLargestPerfectPowerDivisor', () => {
	it('finds the largest divisor that is a power with the requested exponent', () => {
		expect(getLargestPerfectPowerDivisor(72, 2)).toBe(36)
		expect(getLargestPerfectPowerDivisor(432, 3)).toBe(216)
		expect(getLargestPerfectPowerDivisor(64, 2)).toBe(64)
		expect(getLargestPerfectPowerDivisor(13, 2)).toBe(1)
		expect(getLargestPerfectPowerDivisor(72, 1)).toBe(72)
	})

	it.each([[0, 2], [-8, 2], [8, 0], [8, -2], [8.5, 2], [8, 1.5]])('rejects invalid inputs %s and %s', (number, exponent) => {
		expect(() => getLargestPerfectPowerDivisor(number, exponent)).toThrow()
	})
})
