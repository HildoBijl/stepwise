import { ensureNumber } from '@step-wise/js-utils'

// Return the probability density of the normal (Gaussian) distribution.
export function normalPDF(x: number, mu: number = 0, sigma: number = 1): number {
	x = ensureNumber(x, { allowInfinity: true })
	mu = ensureNumber(mu)
	sigma = ensureNumber(sigma, { nonNegative: true, nonZero: true })
	return 1 / (sigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * ((x - mu) / sigma) ** 2)
}
