import { describe, expect, it } from 'vitest'

import { normalPDF } from './distributions.ts'

describe('normalPDF', () => {
	it('returns known standard-normal densities', () => {
		expect(normalPDF(0)).toBeCloseTo(1 / Math.sqrt(2 * Math.PI))
		expect(normalPDF(1)).toBeCloseTo(0.2419707245)
	})

	it('supports a custom mean and standard deviation', () => {
		expect(normalPDF(10, 10, 2)).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)))
	})

	it('is symmetric around the mean', () => {
		expect(normalPDF(7, 5, 3)).toBeCloseTo(normalPDF(3, 5, 3))
	})

	it('scales inversely with the standard deviation at the mean', () => {
		expect(normalPDF(4, 4, 2)).toBeCloseTo(normalPDF(4, 4, 1) / 2)
	})

	it('returns zero at positive and negative infinity', () => {
		expect(normalPDF(Infinity)).toBe(0)
		expect(normalPDF(-Infinity)).toBe(0)
	})

	it.each([[0, Infinity, 1], [0, -Infinity, 1], [0, 0, 0], [0, 0, -1], [NaN, 0, 1], [0, NaN, 1], [0, 0, NaN]])('rejects invalid parameters %s, %s, and %s', (x, mean, standardDeviation) => {
		expect(() => normalPDF(x, mean, standardDeviation)).toThrow()
	})
})
