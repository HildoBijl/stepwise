import { ensureInteger, sum } from '@step-wise/js-utils'

import { type BernsteinCoefficients, getBernsteinDegree } from './fundamentals'

// Get the expected value of x^i, given the PDF f(x) and an integer i. Effectively "∫₀¹ x^i·f(x) dx".
export function getBernsteinMoment(coefficients: BernsteinCoefficients, i: number): number {
	const ensuredI = ensureInteger(i, { nonNegative: true, safe: true })
	const degree = getBernsteinDegree(coefficients)
	return sum(coefficients.map((coefficient, index) => {
		let weightedCoefficient = coefficient
		for (let factorIndex = 1; factorIndex <= ensuredI; factorIndex++) weightedCoefficient *= (index + factorIndex) / (degree + 1 + factorIndex)
		return weightedCoefficient
	}))
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
