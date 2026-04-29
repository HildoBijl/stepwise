import { compareNumbers, sum } from '@step-wise/utils'

import { BernsteinCoefficients } from './types'

// Get the order of a coefficient array, equal to its length minus one.
export function getBernsteinOrder(coefficients: BernsteinCoefficients): number {
	return coefficients.length - 1
}

// Normalize coefficients so their sum equals one. Negative coefficients are clipped to zero first to guard against numerical noise. Only used internally.
export function normalizeBernsteinCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	const ensuredCoefficients = coefficients.map(c => Math.max(c, 0))
	const coefficientSum = sum(ensuredCoefficients)
	return compareNumbers(coefficientSum, 1) ? ensuredCoefficients : ensuredCoefficients.map(c => c / coefficientSum)
}

// Reverse the coefficients. If the coefficients describe x, the result describes 1 - x.
export function invertBernsteinCoefficients(coefficients: BernsteinCoefficients): BernsteinCoefficients {
	return [...coefficients].reverse()
}
