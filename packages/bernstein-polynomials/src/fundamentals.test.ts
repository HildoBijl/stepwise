import { approximatelyEqual, compareNumberArrays } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { elevateBernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients, reflectBernsteinCoefficients } from './fundamentals'
import { getBernsteinPDF } from './distributions'

describe('getBernsteinDegree', () => {
	it('returns the coefficient count minus one', () => {
		expect(getBernsteinDegree([1])).toBe(0)
		expect(getBernsteinDegree([0.1, 0.2, 0.3, 0.4])).toBe(3)
	})

	it('rejects an empty coefficient array', () => {
		expect(() => getBernsteinDegree([])).toThrow(RangeError)
	})
})

describe('elevateBernsteinCoefficients', () => {
	it('elevates coefficients to known values', () => {
		expect(compareNumberArrays(elevateBernsteinCoefficients([0, 1], 2), [0, 1 / 3, 2 / 3])).toBe(true)
	})

	it('preserves normalization and the represented PDF', () => {
		const coefficients = [0.1, 0.2, 0.7]
		const elevatedCoefficients = elevateBernsteinCoefficients(coefficients, 8)
		const pdf = getBernsteinPDF(coefficients)
		const elevatedPDF = getBernsteinPDF(elevatedCoefficients)
		expect(approximatelyEqual(elevatedCoefficients.reduce((total, coefficient) => total + coefficient, 0), 1)).toBe(true)
		;[0, 0.1, 0.25, 0.5, 0.9, 1].forEach(x => expect(elevatedPDF(x)).toBeCloseTo(pdf(x)))
	})

	it('returns the original reference when the degree is unchanged', () => {
		const coefficients = [0.2, 0.8]
		expect(elevateBernsteinCoefficients(coefficients, 1)).toBe(coefficients)
	})

	it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid target degree %s', degree => {
		expect(() => elevateBernsteinCoefficients([1], degree)).toThrow()
	})

	it('rejects lowering the degree', () => {
		expect(() => elevateBernsteinCoefficients([0.2, 0.8], 0)).toThrow()
	})
})

describe('normalizeBernsteinCoefficients', () => {
	it('normalizes coefficients', () => {
		expect(compareNumberArrays(normalizeBernsteinCoefficients([1, 2, 3, 4]), [0.1, 0.2, 0.3, 0.4])).toBe(true)
	})

	it('clips negative values before normalizing', () => {
		expect(normalizeBernsteinCoefficients([-0.1, 1, 1])).toEqual([0, 0.5, 0.5])
	})

	it('does not mutate the input', () => {
		const coefficients = [-0.1, 1]
		normalizeBernsteinCoefficients(coefficients)
		expect(coefficients).toEqual([-0.1, 1])
	})

	it.each([[[0, 0]], [[-1, 0]], [[-2, -1]]])('rejects coefficients without a positive value', coefficients => {
		expect(() => normalizeBernsteinCoefficients(coefficients)).toThrow(RangeError)
	})
})

describe('reflectBernsteinCoefficients', () => {
	it('reflects a distribution without mutating it', () => {
		const coefficients = [0.1, 0.2, 0.7]
		expect(reflectBernsteinCoefficients(coefficients)).toEqual([0.7, 0.2, 0.1])
		expect(coefficients).toEqual([0.1, 0.2, 0.7])
	})

	it('restores the coefficients when applied twice', () => {
		const coefficients = [0.1, 0.2, 0.7]
		expect(reflectBernsteinCoefficients(reflectBernsteinCoefficients(coefficients))).toEqual(coefficients)
	})

	it('reflects the represented PDF around one half', () => {
		const coefficients = [0.1, 0.2, 0.7]
		const pdf = getBernsteinPDF(coefficients)
		const reflectedPDF = getBernsteinPDF(reflectBernsteinCoefficients(coefficients))
		;[0, 0.1, 0.4, 0.75, 1].forEach(x => expect(reflectedPDF(x)).toBeCloseTo(pdf(1 - x)))
	})

	it('rejects an empty coefficient array', () => {
		expect(() => reflectBernsteinCoefficients([])).toThrow(RangeError)
	})
})
