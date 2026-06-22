import { ensureInteger, sum } from '@step-wise/utils'
import { factorial } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder } from './fundamentals'

// Get the expected value of x^i, given the PDF f(x) and an integer i. Effectively "∫₀¹ x^i·f(x) dx".
export function getBernsteinMoment(coefficients: BernsteinCoefficients, i: number): number {
	const ensuredI = ensureInteger(i, true)
	const n = getBernsteinOrder(coefficients)
	return sum(coefficients.map((c, j) => c * factorial(ensuredI + j, j))) / factorial(n + ensuredI + 1, n + 1)
}

// Get the expected value of x, given the coefficients of its distribution. Effectively "∫₀¹ x·f(x) dx".
export function getBernsteinExpectedValue(coefficients: BernsteinCoefficients): number {
	return getBernsteinMoment(coefficients, 1)
}

// Get the variance of x.
export function getBernsteinVariance(coefficients: BernsteinCoefficients): number {
	const expectedValue = getBernsteinExpectedValue(coefficients)
	return getBernsteinMoment(coefficients, 2) - expectedValue ** 2
}
