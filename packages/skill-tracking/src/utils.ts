import { ensureDate, ensureInteger, ensurePlainObject } from '@step-wise/js-utils'
import { ensureBernsteinCoefficients } from '@step-wise/bernstein-polynomials'

import type { RawSkillLevel, SkillLevelUpdate } from './types'

export function getInitialSkillLevel(date = new Date()): RawSkillLevel {
	const ensuredDate = ensureDate(date)
	return {
		coefficients: [1],
		coefficientsOn: new Date(ensuredDate),
		highest: [1],
		highestOn: new Date(ensuredDate),
		numPracticed: 0,
	}
}

export function ensureSkillLevel(value: unknown): RawSkillLevel {
	const obj = ensurePlainObject(value)
	return {
		coefficients: ensureBernsteinCoefficients(obj.coefficients),
		coefficientsOn: new Date(ensureDate(obj.coefficientsOn)),
		highest: ensureBernsteinCoefficients(obj.highest),
		highestOn: new Date(ensureDate(obj.highestOn)),
		numPracticed: ensureInteger(obj.numPracticed, { nonNegative: true, safe: true }),
	}
}

export function ensureSkillLevelUpdate(value: unknown): SkillLevelUpdate {
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
