import { approximatelyEqual, compareNumberArrays, sum } from '@step-wise/js-utils'
import { describe, expect, it } from 'vitest'

import { multiplyBernsteinCoefficientsElementwise, multiplyBernsteinPDFs } from './multiplication'

function expectValidCoefficients(coefficients: readonly number[]): void {
	expect(coefficients.every(coefficient => coefficient >= 0)).toBe(true)
	expect(approximatelyEqual(sum(coefficients), 1)).toBe(true)
}

describe('multiplyBernsteinPDFs', () => {
	it('handles zero or one input', () => {
		expect(multiplyBernsteinPDFs()).toEqual([1])
		const coefficients = [0.2, 0.8]
		expect(multiplyBernsteinPDFs(coefficients)).toBe(coefficients)
	})

	it('multiplies two PDFs to known results', () => {
		expect(compareNumberArrays(multiplyBernsteinPDFs([0, 1], [1, 0]), [0, 1, 0])).toBe(true)
		expect(compareNumberArrays(multiplyBernsteinPDFs([2 / 5, 3 / 5], [0, 1]), [0, 1 / 4, 3 / 4])).toBe(true)
	})

	it('supports multiple PDFs and is commutative', () => {
		const first = [0.2, 0.8]
		const second = [0.7, 0.3]
		const third = [0.1, 0.2, 0.7]
		const result = multiplyBernsteinPDFs(first, second, third)
		expect(compareNumberArrays(result, multiplyBernsteinPDFs(third, first, second))).toBe(true)
		expectValidCoefficients(result)
	})

	it('rejects empty coefficient arrays', () => {
		expect(() => multiplyBernsteinPDFs([])).toThrow(RangeError)
	})
})

describe('multiplyBernsteinCoefficientsElementwise', () => {
	it('handles zero or one input', () => {
		expect(multiplyBernsteinCoefficientsElementwise()).toEqual([1])
		expect(multiplyBernsteinCoefficientsElementwise([0.2, 0.8])).toEqual([0.2, 0.8])
	})

	it('multiplies equal-degree coefficients to known results', () => {
		expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([0.2, 0.8], [0.8, 0.2]), [0.5, 0.5])).toBe(true)
		expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([3 / 7, 4 / 7], [3 / 7, 4 / 7]), [9 / 25, 16 / 25])).toBe(true)
	})

	it('elevates unequal degrees before multiplication', () => {
		expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([1, 0], [0.2, 0.3, 0.5]), [4 / 7, 3 / 7, 0])).toBe(true)
		expect(compareNumberArrays(multiplyBernsteinCoefficientsElementwise([1], [0.2, 0.3, 0.5]), [0.2, 0.3, 0.5])).toBe(true)
	})

	it('supports multiple inputs and is commutative', () => {
		const first = [0.2, 0.8]
		const second = [0.7, 0.3]
		const third = [0.1, 0.2, 0.7]
		const result = multiplyBernsteinCoefficientsElementwise(first, second, third)
		expect(compareNumberArrays(result, multiplyBernsteinCoefficientsElementwise(third, first, second))).toBe(true)
		expectValidCoefficients(result)
	})

	it('rejects empty arrays and coefficients without positive overlap', () => {
		expect(() => multiplyBernsteinCoefficientsElementwise([])).toThrow(RangeError)
		expect(() => multiplyBernsteinCoefficientsElementwise([1, 0], [0, 1])).toThrow(RangeError)
	})
})
