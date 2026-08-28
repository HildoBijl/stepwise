import { type SkillSetupLike, ensureSetup } from '@step-wise/skill-setup'
import { ensureBernsteinCoefficients } from '@step-wise/bernstein-polynomials'
import { ensureBoolean, ensureDate, ensureInteger, ensurePlainObject } from '@step-wise/js-utils'

import type { StoredSkillLevel, StoredSkillLevelUpdate, SkillObservation } from './types.ts'

export function getInitialSkillLevel(date = new Date()): StoredSkillLevel {
	const ensuredDate = ensureDate(date)
	return {
		coefficients: [1],
		coefficientsOn: new Date(ensuredDate),
		highest: [1],
		highestOn: new Date(ensuredDate),
		numPracticed: 0,
	}
}

export function ensureSkillLevel(value: unknown): StoredSkillLevel {
	const obj = ensurePlainObject(value)
	return {
		coefficients: ensureBernsteinCoefficients(obj.coefficients),
		coefficientsOn: new Date(ensureDate(obj.coefficientsOn)),
		highest: ensureBernsteinCoefficients(obj.highest),
		highestOn: new Date(ensureDate(obj.highestOn)),
		numPracticed: ensureInteger(obj.numPracticed, { nonNegative: true, safe: true }),
	}
}

export function ensureStoredSkillLevelUpdate(value: unknown): StoredSkillLevelUpdate {
	const obj = ensurePlainObject(value)
	const hasHighest = obj.highest !== undefined
	const hasHighestOn = obj.highestOn !== undefined
	if (hasHighest !== hasHighestOn) throw new TypeError('Invalid skill level update: "highest" and "highestOn" must either both be provided or both be omitted.')
	return {
		coefficients: ensureBernsteinCoefficients(obj.coefficients),
		coefficientsOn: new Date(ensureDate(obj.coefficientsOn)),
		numPracticed: ensureInteger(obj.numPracticed, { nonNegative: true, safe: true }),
		...(hasHighest ? {
			highest: ensureBernsteinCoefficients(obj.highest),
			highestOn: new Date(ensureDate(obj.highestOn)),
		} : {}),
	}
}

export function ensureSkillObservation(value: unknown): SkillObservation {
	const obj = ensurePlainObject(value)
	return {
		setup: ensureSetup(obj.setup as SkillSetupLike),
		correct: ensureBoolean(obj.correct),
	}
}
