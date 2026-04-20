import { ensureInt, mergeDefaults, sum, repeat } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { maxOrder, maxSmoothingOrder, decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } from '../settings'

import { Coefficients } from './types'
import { getOrder, normalize } from './fundamentals'

export type SmoothingOptions = {
	time?: number
	applyPracticeDecay?: boolean
	numProblemsPracticed?: number
	decayHalfLife?: number
	initialPracticeDecayTime?: number
	practiceDecayHalfLife?: number
}

const defaultSmoothingOptions: Required<SmoothingOptions> = {
	time: 0,
	applyPracticeDecay: false,
	numProblemsPracticed: 0,
	decayHalfLife,
	initialPracticeDecayTime,
	practiceDecayHalfLife,
}

// Smooth a set of coefficients by determining a smoothing factor from the given options.
export function smooth(coefficients: Coefficients, options?: SmoothingOptions): Coefficients {
	return smoothWithFactor(coefficients, getSmoothingFactor(options))
}

/* Get the smoothing factor based on the given options:
 * - time (default 0): how much time in milliseconds has passed since the last exercise?
 * - applyPracticeDecay (default false): should practice decay be applied?
 * - numProblemsPracticed (default 0): how many times has the user practiced this skill before?
 */
export function getSmoothingFactor(options: SmoothingOptions = {}): number {
	const { time, applyPracticeDecay, numProblemsPracticed, decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } = mergeDefaults(options, defaultSmoothingOptions)
	const practiceDecayTime = applyPracticeDecay ? initialPracticeDecayTime * (1 / 2) ** (numProblemsPracticed / practiceDecayHalfLife) : 0
	const equivalentTime = time + practiceDecayTime
	return (1 / 2) ** (equivalentTime / decayHalfLife)
}

// Smooth the distribution described by the coefficients with a given factor. A factor of 1 leaves the distribution unchanged, while 0 brings it back to the starting distribution. Effectively, the new mean is 0.5 + (mu_old - 0.5) * factor. If the factor is too close to one, then no smoothing is done, unless the coefficient array is too large, which may cause numerical problems.
export function smoothWithFactor(coefficients: Coefficients, factor: number): Coefficients {
	// Check boundary cases.
	if (factor < 0 || factor > 1) throw new Error(`Invalid input: the smoothing factor must be a number between 0 and 1 (inclusive) but received "${factor}".`)
	if (factor === 0 || coefficients.length <= 1) return [1]
	if (factor === 1) return coefficients

	// Calculate smoothing orders.
	const smoothingOrders: number[] = []
	let remainingFactor = factor
	while (true) {
		const newOrder = Math.ceil(2 * remainingFactor / (1 - remainingFactor) - 1e-15) // Compensate for numerical issues.
		if (newOrder > maxSmoothingOrder) break
		smoothingOrders.push(newOrder)
		remainingFactor /= newOrder / (newOrder + 2)
	}
	if (smoothingOrders.length === 0 && getOrder(coefficients) > maxOrder) smoothingOrders.push(maxSmoothingOrder)

	// Apply smoothing orders.
	smoothingOrders.reverse().forEach(newOrder => {
		coefficients = smoothWithOrder(coefficients, newOrder)
	})
	return coefficients
}

// Smooth the distribution described by the coefficients using a smoothing order. If the smoothing order is too high, no smoothing is done.
export function smoothWithOrder(coefficients: Coefficients, newOrder: number): Coefficients {
	const ensuredNewOrder = ensureInt(newOrder, true)

	// Check boundary cases.
	if (coefficients.length <= 1) return new Array(ensuredNewOrder + 1).fill(1 / (ensuredNewOrder + 1))
	if (ensuredNewOrder > maxSmoothingOrder) return coefficients

	// Apply smoothing.
	const oldOrder = getOrder(coefficients)
	return normalize(repeat(ensuredNewOrder + 1, i => sum(coefficients.map((c, j) => c * binomial(i + j, i) * binomial(ensuredNewOrder + oldOrder - i - j, oldOrder - j)))))
}
