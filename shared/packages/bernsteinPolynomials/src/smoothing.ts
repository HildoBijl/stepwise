import { ensureInt, sum, repeat } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { BernsteinCoefficients } from './types'
import { getBernsteinOrder, normalizeBernsteinCoefficients } from './fundamentals'

// General coefficient settings.
export const maxBernsteinOrder = 150 // If we encounter a higher order coefficient array than this, then we will always do smoothing to keep it manageable.
export const maxBernsteinSmoothingOrder = 120 // The maximum order for smoothing. This needs a cap, for numerical reasons. For higher values the binomials start failing.

// Smooth the distribution described by the coefficients using a smoothing order. If the smoothing order is too high, no smoothing is done.
export function smoothBernsteinCoefficientsWithOrder(coefficients: BernsteinCoefficients, newOrder: number): BernsteinCoefficients {
	const ensuredNewOrder = ensureInt(newOrder, true)

	// Check boundary cases.
	if (coefficients.length <= 1) return [1]
	if (ensuredNewOrder > maxBernsteinSmoothingOrder) return coefficients

	// Apply smoothing.
	const oldOrder = getBernsteinOrder(coefficients)
	return normalizeBernsteinCoefficients(repeat(ensuredNewOrder + 1, i => sum(coefficients.map((c, j) => c * binomial(i + j, i) * binomial(ensuredNewOrder + oldOrder - i - j, oldOrder - j)))))
}

// Smooth the distribution described by the coefficients with a given factor. A factor of 1 leaves the distribution unchanged, while 0 brings it back to the starting distribution. Effectively, the new mean is 0.5 + (mu_old - 0.5) * factor. If the factor is too close to one, then no smoothing is done, unless the coefficient array is too large, which may cause numerical problems.
export function smoothBernsteinCoefficientsWithFactor(coefficients: BernsteinCoefficients, factor: number): BernsteinCoefficients {
	// Check boundary cases.
	if (factor < 0 || factor > 1) throw new Error(`Invalid input: the smoothing factor must be a number between 0 and 1 (inclusive) but received "${factor}".`)
	if (factor === 0 || coefficients.length <= 1) return [1]
	if (factor === 1) return coefficients

	// Calculate smoothing orders.
	const smoothingOrders: number[] = []
	let remainingFactor = factor
	while (true) {
		const newOrder = Math.ceil(2 * remainingFactor / (1 - remainingFactor) - 1e-15) // Compensate for numerical issues.
		if (newOrder > maxBernsteinSmoothingOrder) break
		smoothingOrders.push(newOrder)
		remainingFactor /= newOrder / (newOrder + 2)
	}
	if (smoothingOrders.length === 0 && getBernsteinOrder(coefficients) > maxBernsteinOrder) smoothingOrders.push(maxBernsteinSmoothingOrder)

	// Apply smoothing orders.
	smoothingOrders.reverse().forEach(newOrder => {
		coefficients = smoothBernsteinCoefficientsWithOrder(coefficients, newOrder)
	})
	return coefficients
}
