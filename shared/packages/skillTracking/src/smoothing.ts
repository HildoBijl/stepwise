import { mergeDefaults } from '@step-wise/utils'
import { type BernsteinCoefficients, smoothBernsteinCoefficientsWithFactor } from '@step-wise/bernstein-polynomials'

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
	const { time, applyPracticeDecay, numProblemsPracticed, decayHalfLife, initialPracticeDecayTime, practiceDecayHalfLife } = mergeDefaults(options, defaultSmoothingOptions)
	const practiceDecayTime = applyPracticeDecay ? initialPracticeDecayTime * (1 / 2) ** (numProblemsPracticed / practiceDecayHalfLife) : 0
	const equivalentTime = time + practiceDecayTime
	return (1 / 2) ** (equivalentTime / decayHalfLife)
}

// Smooth a set of coefficients by determining a smoothing factor from the given options.
export function smoothBernsteinCoefficients(coefficients: BernsteinCoefficients, options?: BernsteinSmoothingOptions): BernsteinCoefficients {
	return smoothBernsteinCoefficientsWithFactor(coefficients, getBernsteinSmoothingFactor(options))
}
