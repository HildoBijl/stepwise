import { compareNumbers, ensureNumberArray, sum, isPlainObject, fromKeys } from '@step-wise/utils'

import { BernsteinCoefficients, BernsteinCoefficientSet } from './types'

// Ensure a value is a valid coefficient array: an array of non-negative numbers whose sum equals one. Returns a copied array.
export function ensureBernsteinCoefficients(coefficients: unknown, requireNormalized = true): BernsteinCoefficients {
	const ensuredCoefficients = ensureNumberArray(coefficients, true)
	if (requireNormalized && !compareNumbers(sum(ensuredCoefficients), 1)) throw new Error(`Invalid input: expected a coefficient array whose sum equals one, but the sum instead is ${sum(ensuredCoefficients)}. The array itself is [${ensuredCoefficients.join(', ')}].`)
	return ensuredCoefficients
}

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

// Ensure a value is a valid coefficient set. If requiredSkillIds is given, only those skills are returned and all must exist.
export function ensureBernsteinCoefficientSet(coefficientSet: unknown, requiredSkillIds?: string[]): BernsteinCoefficientSet {
	if (!isPlainObject(coefficientSet)) throw new Error(`Invalid coefficient set: expected the coefficient set parameter to be a plain object but received something of type "${typeof coefficientSet}".`)
	if (requiredSkillIds) {
		const missingSkillId = requiredSkillIds.find(skillId => !(skillId in coefficientSet))
		if (missingSkillId) throw new Error(`Invalid coefficient set: coefficients for "${missingSkillId}" were missing.`)
	}
	return fromKeys(requiredSkillIds ?? Object.keys(coefficientSet), skillId => ensureBernsteinCoefficients(coefficientSet[skillId]))
}

// Get coefficients for a given skill ID from a coefficient set.
export function getBernsteinCoefficients(coefficients: BernsteinCoefficientSet, skillId: string): BernsteinCoefficients {
	if (!(skillId in coefficients)) throw new Error(`Invalid skill ID: the skill ID "${skillId}" did not exist in the given coefficient set.`)
	return coefficients[skillId]
}
