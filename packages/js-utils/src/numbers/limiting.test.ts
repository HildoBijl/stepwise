import { describe, expect, it } from 'vitest'

import { clamp, isBetween, mod } from './limiting'

describe('number limiting', () => {
	it('calculates a positive modulus', () => {
		expect(mod(7, 5)).toBe(2)
		expect(mod(-1, 5)).toBe(4)
		expect(() => mod(1, 0)).toThrow(RangeError)
	})

	it('clamps using finite or infinite bounds', () => {
		expect(clamp(-1)).toBe(0)
		expect(clamp(3, 1, 2)).toBe(2)
		expect(clamp(3, -Infinity, Infinity)).toBe(3)
		expect(() => clamp(1, 2, 1)).toThrow(RangeError)
	})

	it('checks inclusive and exclusive ranges', () => {
		expect(isBetween(0, 0, 1)).toBe(true)
		expect(isBetween(0, 0, 1, { inclusive: false })).toBe(false)
		expect(isBetween(4, -Infinity, Infinity)).toBe(true)
		expect(() => isBetween(1, 2, 1)).toThrow(RangeError)
	})
})
