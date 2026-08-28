import { type BernsteinCoefficients, ensureBernsteinCoefficients, smoothBernsteinCoefficientsWithRetentionFactor } from '@step-wise/bernstein-polynomials'
import { ensureBoolean, ensureInteger, ensureNumber, mergeDefaults } from '@step-wise/js-utils'

import { timeDecayHalfLife, initialPracticeDecayTime, practiceCountHalfLife } from './settings.ts'

export type SkillLevelDecayOptions = {
	elapsedTime?: number
	applyPracticeEffect?: boolean
	practiceCount?: number
	timeDecayHalfLife?: number
	initialPracticeDecayTime?: number
	practiceCountHalfLife?: number
}

const defaultDecayOptions: Required<SkillLevelDecayOptions> = {
	elapsedTime: 0,
	applyPracticeEffect: false,
	practiceCount: 0,
	timeDecayHalfLife,
	initialPracticeDecayTime,
	practiceCountHalfLife,
}

/* Get the retention factor based on the given options:
 * - elapsedTime (default 0): how much time in milliseconds has passed since the last exercise?
 * - applyPracticeEffect (default false): should practice decay be applied?
 * - practiceCount (default 0): how many times has the user practiced this skill before?
 */
function getSkillLevelRetentionFactor(options: SkillLevelDecayOptions = {}): number {
	const mergedOptions = mergeDefaults(options, defaultDecayOptions)
	const elapsedTime = ensureNumber(mergedOptions.elapsedTime, { nonNegative: true })
	const applyPracticeEffect = ensureBoolean(mergedOptions.applyPracticeEffect)
	const practiceCount = ensureInteger(mergedOptions.practiceCount, { nonNegative: true, safe: true })
	const ensuredDecayHalfLife = ensureNumber(mergedOptions.timeDecayHalfLife, { nonNegative: true, nonZero: true })
	const ensuredInitialPracticeDecayTime = ensureNumber(mergedOptions.initialPracticeDecayTime, { nonNegative: true })
	const ensuredPracticeDecayHalfLife = ensureNumber(mergedOptions.practiceCountHalfLife, { nonNegative: true, nonZero: true })
	const practiceDecayTime = applyPracticeEffect ? ensuredInitialPracticeDecayTime * (1 / 2) ** (practiceCount / ensuredPracticeDecayHalfLife) : 0
	const equivalentTime = elapsedTime + practiceDecayTime
	return (1 / 2) ** (equivalentTime / ensuredDecayHalfLife)
}

// Apply decay to a set of coefficients by determining a retention factor from the given options.
export function applySkillLevelDecay(coefficients: BernsteinCoefficients, options?: SkillLevelDecayOptions): BernsteinCoefficients {
	return smoothBernsteinCoefficientsWithRetentionFactor(ensureBernsteinCoefficients(coefficients), getSkillLevelRetentionFactor(options))
}
