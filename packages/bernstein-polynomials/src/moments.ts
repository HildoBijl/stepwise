import { ensureInteger, sum } from '@step-wise/js-utils'

import { type BernsteinCoefficients, getBernsteinDegree } from './fundamentals.ts'

// Get the expected value of x raised to a non-negative integer exponent.
export function getBernsteinMoment(coefficients: BernsteinCoefficients, exponent: number): number {
	const ensuredExponent = ensureInteger(exponent, { nonNegative: true, safe: true })
	const degree = getBernsteinDegree(coefficients)
	return sum(coefficients.map((coefficient, index) => {
		let weightedCoefficient = coefficient
		for (let factorIndex = 1; factorIndex <= ensuredExponent; factorIndex++) weightedCoefficient *= (index + factorIndex) / (degree + 1 + factorIndex)
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
