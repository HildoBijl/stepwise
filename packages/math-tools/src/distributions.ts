import { ensureNumber } from '@step-wise/js-utils'

// Return the probability density of the normal (Gaussian) distribution.
export function normalPDF(x: number, mean: number = 0, standardDeviation: number = 1): number {
	x = ensureNumber(x, { allowInfinity: true })
	mean = ensureNumber(mean)
	standardDeviation = ensureNumber(standardDeviation, { nonNegative: true, nonZero: true })
	const z = (x - mean) / standardDeviation
	return 1 / (standardDeviation * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z ** 2)
}
