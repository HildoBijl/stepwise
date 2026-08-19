import { describe, expect, it } from 'vitest'

import { getBernsteinCDF, getBernsteinPDF, getBernsteinPDFDerivative, getBernsteinPDFMaximum, getBernsteinQuantileFunction } from './distributions'

function integrate(functionToIntegrate: (x: number) => number, steps = 10000): number {
	const stepSize = 1 / steps
	let result = (functionToIntegrate(0) + functionToIntegrate(1)) / 2
	for (let index = 1; index < steps; index++) result += functionToIntegrate(index * stepSize)
	return result * stepSize
}

describe('getBernsteinPDF', () => {
	it('evaluates known PDFs', () => {
		expect(getBernsteinPDF([1])(0.4)).toBe(1)
		const pdf = getBernsteinPDF([0, 0, 1, 0])
		expect(pdf(0)).toBe(0)
		expect(pdf(0.5)).toBe(1.5)
		expect(pdf(1)).toBe(0)
	})

	it('returns zero outside the unit interval', () => {
		const pdf = getBernsteinPDF([1])
		expect([-Infinity, -1, 2, Infinity].map(pdf)).toEqual([0, 0, 0, 0])
	})

	it('rejects NaN', () => {
		expect(() => getBernsteinPDF([1])(NaN)).toThrow(TypeError)
	})

	it('integrates to one', () => {
		expect(integrate(getBernsteinPDF([0.1, 0.2, 0.7]))).toBeCloseTo(1, 6)
	})
})

describe('getBernsteinPDFDerivative', () => {
	it('returns zero for a constant PDF and outside the unit interval', () => {
		const derivative = getBernsteinPDFDerivative([1])
		expect([-1, 0, 0.5, 1, 2].map(derivative)).toEqual([0, 0, 0, 0, 0])
	})

	it('agrees with a finite-difference approximation', () => {
		const pdf = getBernsteinPDF([0.1, 0.2, 0.7])
		const derivative = getBernsteinPDFDerivative([0.1, 0.2, 0.7])
		const step = 1e-6
		;[0.1, 0.4, 0.8].forEach(x => expect(derivative(x)).toBeCloseTo((pdf(x + step) - pdf(x - step)) / (2 * step), 5))
	})

	it('rejects NaN', () => {
		expect(() => getBernsteinPDFDerivative([1])(NaN)).toThrow(TypeError)
	})
})

describe('getBernsteinCDF', () => {
	it('evaluates known values and boundary behavior', () => {
		const cdf = getBernsteinCDF([1])
		expect(cdf(-Infinity)).toBe(0)
		expect(cdf(0)).toBe(0)
		expect(cdf(0.25)).toBeCloseTo(0.25)
		expect(cdf(1)).toBe(1)
		expect(cdf(Infinity)).toBe(1)
	})

	it('is non-decreasing and agrees with PDF integration', () => {
		const coefficients = [0.1, 0.2, 0.7]
		const cdf = getBernsteinCDF(coefficients)
		const values = [0, 0.2, 0.4, 0.6, 0.8, 1].map(cdf)
		values.slice(1).forEach((value, index) => expect(value).toBeGreaterThanOrEqual(values[index]))
		const x = 0.6
		expect(cdf(x)).toBeCloseTo(integrate(value => getBernsteinPDF(coefficients)(value * x)) * x, 5)
	})

	it('rejects NaN', () => {
		expect(() => getBernsteinCDF([1])(NaN)).toThrow(TypeError)
	})
})

describe('getBernsteinQuantileFunction', () => {
	it('handles endpoint probabilities exactly and inverts the CDF', () => {
		const cdf = getBernsteinCDF([0.1, 0.2, 0.7])
		const quantile = getBernsteinQuantileFunction([0.1, 0.2, 0.7], { iterations: 30 })
		expect(quantile(0)).toBe(0)
		expect(quantile(1)).toBe(1)
		;[0.1, 0.5, 0.9].forEach(probability => expect(cdf(quantile(probability))).toBeCloseTo(probability, 7))
	})

	it('is non-decreasing', () => {
		const quantile = getBernsteinQuantileFunction([0.1, 0.2, 0.7])
		const values = [0, 0.2, 0.4, 0.6, 0.8, 1].map(quantile)
		values.slice(1).forEach((value, index) => expect(value).toBeGreaterThanOrEqual(values[index]))
	})

	it.each([NaN, -0.1, 1.1, Infinity])('rejects invalid probability %s', probability => {
		expect(() => getBernsteinQuantileFunction([1])(probability)).toThrow()
	})

	it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid iteration count %s', iterations => {
		expect(() => getBernsteinQuantileFunction([1], { iterations })).toThrow()
	})
})

describe('getBernsteinPDFMaximum', () => {
	it('finds maxima for constant, endpoint, and interior cases', () => {
		expect(getBernsteinPDFMaximum([1])).toEqual({ x: 0, density: 1 })
		const endpointMaximum = getBernsteinPDFMaximum([0, 1])
		expect(endpointMaximum).toEqual({ x: 1, density: 2 })
		const interiorMaximum = getBernsteinPDFMaximum([0, 1, 0])
		expect(interiorMaximum.x).toBeCloseTo(0.5)
		expect(interiorMaximum.density).toBeCloseTo(1.5)
	})

	it('agrees with dense sampling for an asymmetric distribution', () => {
		const coefficients = [0, 0.1, 0.7, 0.2]
		const pdf = getBernsteinPDF(coefficients)
		const maximum = getBernsteinPDFMaximum(coefficients, { iterations: 30 })
		const sampledMaximum = Math.max(...Array.from({ length: 10001 }, (_, index) => pdf(index / 10000)))
		expect(maximum.density).toBeCloseTo(sampledMaximum, 6)
		expect(pdf(maximum.x)).toBeCloseTo(maximum.density, 10)
	})

	it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid iteration count %s', iterations => {
		expect(() => getBernsteinPDFMaximum([1], { iterations })).toThrow()
	})
})
