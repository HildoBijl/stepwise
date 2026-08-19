import { describe, expect, it } from 'vitest'

import { gcd, lcm } from './divisors'

describe('gcd', () => {
	it('calculates greatest common divisors', () => {
		expect(gcd(18)).toBe(18)
		expect(gcd(48, 18)).toBe(6)
		expect(gcd(54, 24, 90)).toBe(6)
		expect(gcd(35, 64)).toBe(1)
	})

	it('normalizes signs and supports zero', () => {
		expect(gcd(-48, 18)).toBe(6)
		expect(gcd(-48, -18)).toBe(6)
		expect(gcd(0, 18)).toBe(18)
		expect(gcd(0, 0)).toBe(0)
	})

	it('is independent of argument order', () => {
		expect(gcd(84, 30, 18)).toBe(gcd(18, 84, 30))
	})

	it('requires at least one safe integer', () => {
		expect(() => gcd()).toThrow(RangeError)
		expect(() => gcd(2.5)).toThrow()
		expect(() => gcd(Number.MAX_SAFE_INTEGER + 1)).toThrow()
	})
})

describe('lcm', () => {
	it('calculates least common multiples', () => {
		expect(lcm(12)).toBe(12)
		expect(lcm(4, 6)).toBe(12)
		expect(lcm(4, 6, 10)).toBe(60)
		expect(lcm(7, 11)).toBe(77)
	})

	it('normalizes signs and returns zero when any input is zero', () => {
		expect(lcm(-4, 6)).toBe(12)
		expect(lcm(-4, -6)).toBe(12)
		expect(lcm(0, 6)).toBe(0)
		expect(lcm(0, 0)).toBe(0)
	})

	it('is independent of argument order', () => {
		expect(lcm(4, 6, 10)).toBe(lcm(10, 4, 6))
	})

	it('requires at least one safe integer', () => {
		expect(() => lcm()).toThrow(RangeError)
		expect(() => lcm(2.5)).toThrow()
		expect(() => lcm(Number.MAX_SAFE_INTEGER + 1)).toThrow()
	})
})
