import { describe, expect, it } from 'vitest'

import { ensureBernsteinCoefficients } from './checks.ts'

describe('ensureBernsteinCoefficients', () => {
	it('accepts normalized non-negative coefficients and returns a copy', () => {
		const coefficients = [0.1, 0.3, 0.6]
		const result = ensureBernsteinCoefficients(coefficients)
		expect(result).toEqual(coefficients)
		expect(result).not.toBe(coefficients)
	})

	it('allows non-normalized coefficients when requested', () => {
		expect(ensureBernsteinCoefficients([1, 2], { requireNormalized: false })).toEqual([1, 2])
	})

	it('allows minor floating-point deviations in the sum', () => {
		expect(ensureBernsteinCoefficients([0.1, 0.2, 0.7 + Number.EPSILON])).toHaveLength(3)
	})

	it.each([1, null, {}, 'coefficients'])('rejects non-array input %s', value => {
		expect(() => ensureBernsteinCoefficients(value)).toThrow()
	})

	it.each([[['1']], [[NaN]], [[Infinity]], [[-0.1, 1.1]]])('rejects invalid coefficient values in %s', coefficients => {
		expect(() => ensureBernsteinCoefficients(coefficients)).toThrow()
	})

	it('rejects empty arrays regardless of the normalization requirement', () => {
		expect(() => ensureBernsteinCoefficients([])).toThrow(RangeError)
		expect(() => ensureBernsteinCoefficients([], { requireNormalized: false })).toThrow(RangeError)
	})

	it('requires normalized coefficients by default', () => {
		expect(() => ensureBernsteinCoefficients([1, 1])).toThrow()
	})
})
