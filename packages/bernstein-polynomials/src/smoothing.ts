import { ensureInteger, ensureNumber, sum, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'

import { type BernsteinCoefficients, getBernsteinDegree, normalizeBernsteinCoefficients } from './fundamentals.ts'

// General coefficient settings.
export const maxBernsteinDegreeBeforeSmoothing = 150 // If we encounter a higher-degree coefficient array than this, then we will always do smoothing to keep it manageable.
export const maxBernsteinSmoothingDegree = 120 // The maximum smoothing degree. This needs a cap, for numerical reasons. For higher values the binomials start failing.

// Smooth the distribution described by the coefficients to a given degree.
export function smoothBernsteinCoefficientsToDegree(coefficients: BernsteinCoefficients, degree: number): BernsteinCoefficients {
	const newDegree = Math.min(ensureInteger(degree, { nonNegative: true, safe: true }), maxBernsteinSmoothingDegree)
	const oldDegree = getBernsteinDegree(coefficients)
	return normalizeBernsteinCoefficients(repeat(newDegree + 1, newIndex => sum(coefficients.map((coefficient, oldIndex) => coefficient * binomialCoefficient(newIndex + oldIndex, newIndex) * binomialCoefficient(newDegree + oldDegree - newIndex - oldIndex, oldDegree - oldIndex)))))
}

// Smooth the distribution with a retention factor. One leaves it unchanged, while zero returns the uniform starting distribution.
export function smoothBernsteinCoefficientsWithRetentionFactor(coefficients: BernsteinCoefficients, retentionFactor: number): BernsteinCoefficients {
	// Check boundary cases.
	const oldDegree = getBernsteinDegree(coefficients)
	retentionFactor = ensureNumber(retentionFactor, { nonNegative: true })
	if (retentionFactor > 1) throw new RangeError(`Invalid input: the retention factor must be a number between 0 and 1 (inclusive) but received "${retentionFactor}".`)
	if (retentionFactor === 0 || coefficients.length <= 1) return [1]
	if (retentionFactor === 1) return coefficients

	// Calculate smoothing degrees.
	const smoothingDegrees: number[] = []
	let remainingRetentionFactor = retentionFactor
	while (true) {
		const newDegree = Math.ceil(2 * remainingRetentionFactor / (1 - remainingRetentionFactor) - 1e-15) // Compensate for numerical issues.
		if (newDegree > maxBernsteinSmoothingDegree) break
		smoothingDegrees.push(newDegree)
		remainingRetentionFactor /= newDegree / (newDegree + 2)
	}
	if (smoothingDegrees.length === 0 && oldDegree > maxBernsteinDegreeBeforeSmoothing) smoothingDegrees.push(maxBernsteinSmoothingDegree)

	// Apply smoothing degrees.
	smoothingDegrees.reverse().forEach(newDegree => {
		coefficients = smoothBernsteinCoefficientsToDegree(coefficients, newDegree)
	})
	return coefficients
}
