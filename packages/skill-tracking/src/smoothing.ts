import { type BernsteinCoefficients, ensureBernsteinCoefficients, smoothBernsteinCoefficientsWithRetentionFactor } from '@step-wise/bernstein-polynomials'
import { ensureBoolean, ensureInteger, ensureNumber, mergeDefaults } from '@step-wise/js-utils'

import { decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } from './settings'

export type BernsteinSmoothingOptions = {
	time?: number
	applyPracticeDecay?: boolean
	numProblemsPracticed?: number
	decayHalfLife?: number
	initialPracticeDecayTime?: number
	practiceDecayHalfLife?: number
}

const defaultSmoothingOptions: Required<BernsteinSmoothingOptions> = {
	time: 0,
	applyPracticeDecay: false,
	numProblemsPracticed: 0,
	decayHalfLife,
	initialPracticeDecayTime,
	practiceDecayHalfLife,
}

/* Get the smoothing factor based on the given options:
 * - time (default 0): how much time in milliseconds has passed since the last exercise?
 * - applyPracticeDecay (default false): should practice decay be applied?
 * - numProblemsPracticed (default 0): how many times has the user practiced this skill before?
 */
function getBernsteinSmoothingFactor(options: BernsteinSmoothingOptions = {}): number {
	const mergedOptions = mergeDefaults(options, defaultSmoothingOptions)
	const time = ensureNumber(mergedOptions.time, { nonNegative: true })
	const applyPracticeDecay = ensureBoolean(mergedOptions.applyPracticeDecay)
	const numProblemsPracticed = ensureInteger(mergedOptions.numProblemsPracticed, { nonNegative: true, safe: true })
	const ensuredDecayHalfLife = ensureNumber(mergedOptions.decayHalfLife, { nonNegative: true, nonZero: true })
	const ensuredInitialPracticeDecayTime = ensureNumber(mergedOptions.initialPracticeDecayTime, { nonNegative: true })
	const ensuredPracticeDecayHalfLife = ensureNumber(mergedOptions.practiceDecayHalfLife, { nonNegative: true, nonZero: true })
	const practiceDecayTime = applyPracticeDecay ? ensuredInitialPracticeDecayTime * (1 / 2) ** (numProblemsPracticed / ensuredPracticeDecayHalfLife) : 0
	const equivalentTime = time + practiceDecayTime
	return (1 / 2) ** (equivalentTime / ensuredDecayHalfLife)
}

// Smooth a set of coefficients by determining a smoothing factor from the given options.
export function smoothBernsteinCoefficients(coefficients: BernsteinCoefficients, options?: BernsteinSmoothingOptions): BernsteinCoefficients {
	return smoothBernsteinCoefficientsWithRetentionFactor(ensureBernsteinCoefficients(coefficients), getBernsteinSmoothingFactor(options))
}
