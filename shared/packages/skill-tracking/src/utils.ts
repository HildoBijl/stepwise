import { ensureObject, ensureNumber, ensureDate } from '@step-wise/utils'
import { ensureBernsteinCoefficients } from '@step-wise/bernstein-polynomials'

import { RawSkillLevel } from './types'

export function getInitialSkillLevel(date = new Date()): RawSkillLevel {
	return {
		coefficients: [1],
		coefficientsOn: date,
		highest: [1],
		highestOn: date,
		numPracticed: 0,
	}
}

export function ensureSkillLevel(value: unknown): RawSkillLevel {
	const obj = ensureObject(value)
	return {
		coefficients: ensureBernsteinCoefficients(obj.coefficients),
		coefficientsOn: ensureDate(obj.coefficientsOn),
		highest: ensureBernsteinCoefficients(obj.highest),
		highestOn: ensureDate(obj.highestOn),
		numPracticed: ensureNumber(obj.numPracticed),
	}
}
