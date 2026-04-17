import { ensureInt, sum, factorial } from '@step-wise/utils'

import { Coefficients } from './types'
import { getOrder } from './fundamentals'

// Get the expected value of x^i, given the PDF f(x) and an integer i. Effectively "∫₀¹ x^i·f(x) dx".
export function getMoment(coefficients: Coefficients, i: number): number {
	const ensuredI = ensureInt(i, true)
	const n = getOrder(coefficients)
	return sum(coefficients.map((c, j) => c * factorial(ensuredI + j, j))) / factorial(n + ensuredI + 1, n + 1)
}

// Get the expected value of x, given the coefficients of its distribution. Effectively "∫₀¹ x·f(x) dx".
export function getExpectedValue(coefficients: Coefficients): number {
	return getMoment(coefficients, 1)
}

// Get the variance of x.
export function getVariance(coefficients: Coefficients): number {
	const expectedValue = getExpectedValue(coefficients)
	return getMoment(coefficients, 2) - expectedValue ** 2
}
