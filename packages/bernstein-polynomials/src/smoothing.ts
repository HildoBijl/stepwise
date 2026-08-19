import { ensureInteger, ensureNumber, sum, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { type BernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients } from './fundamentals'

// General coefficient settings.
export const maxBernsteinDegreeBeforeSmoothing = 150 // If we encounter a higher-degree coefficient array than this, then we will always do smoothing to keep it manageable.
export const maxBernsteinSmoothingDegree = 120 // The maximum smoothing degree. This needs a cap, for numerical reasons. For higher values the binomials start failing.

// Smooth the distribution described by the coefficients to a given degree.
export function smoothBernsteinCoefficientsToDegree(coefficients: BernsteinCoefficients, degree: number): BernsteinCoefficients {
	const newDegree = Math.min(ensureInteger(degree, { nonNegative: true, safe: true }), maxBernsteinSmoothingDegree)
	const oldDegree = getBernsteinDegree(coefficients)
	return normalizeBernsteinCoefficients(repeat(newDegree + 1, i => sum(coefficients.map((c, j) => c * binomialCoefficient(i + j, i) * binomialCoefficient(newDegree + oldDegree - i - j, oldDegree - j)))))
}

// Smooth the distribution described by the coefficients with a given factor. A factor of 1 leaves the distribution unchanged, while 0 brings it back to the starting distribution. Effectively, the new mean is 0.5 + (mu_old - 0.5) * factor. If the factor is too close to one, then no smoothing is done, unless the coefficient array is too large, which may cause numerical problems.
export function smoothBernsteinCoefficientsWithFactor(coefficients: BernsteinCoefficients, factor: number): BernsteinCoefficients {
	// Check boundary cases.
	const oldDegree = getBernsteinDegree(coefficients)
	factor = ensureNumber(factor, { nonNegative: true })
	if (factor > 1) throw new RangeError(`Invalid input: the smoothing factor must be a number between 0 and 1 (inclusive) but received "${factor}".`)
	if (factor === 0 || coefficients.length <= 1) return [1]
	if (factor === 1) return coefficients

	// Calculate smoothing degrees.
	const smoothingDegrees: number[] = []
	let remainingFactor = factor
	while (true) {
		const newDegree = Math.ceil(2 * remainingFactor / (1 - remainingFactor) - 1e-15) // Compensate for numerical issues.
		if (newDegree > maxBernsteinSmoothingDegree) break
		smoothingDegrees.push(newDegree)
		remainingFactor /= newDegree / (newDegree + 2)
	}
	if (smoothingDegrees.length === 0 && oldDegree > maxBernsteinDegreeBeforeSmoothing) smoothingDegrees.push(maxBernsteinSmoothingDegree)

	// Apply smoothing degrees.
	smoothingDegrees.reverse().forEach(newDegree => {
		coefficients = smoothBernsteinCoefficientsToDegree(coefficients, newDegree)
	})
	return coefficients
}
