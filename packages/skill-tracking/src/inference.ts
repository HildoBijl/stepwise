import { type Polynomial, type PolynomialVariable, evaluatePolynomial, getPolynomialPowers, substitutePolynomialMoments } from '@step-wise/polynomials'
import { type BernsteinCoefficients, getBernsteinMoment, multiplyBernsteinCoefficientsElementwise, multiplyBernsteinPDFs, normalizeBernsteinCoefficients, smoothBernsteinCoefficientsWithRetentionFactor } from '@step-wise/bernstein-polynomials'
import { ensureInteger, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import type { SkillSetup } from '@step-wise/skill-setup'
import type { Skill } from '@step-wise/skill-definition'

import { defaultInferenceOrder, defaultSkillLinkCorrelation } from './settings.ts'

// Find the expected value of a set-up.
export function getSetupExpectedSuccessRate(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients): number {
	const polynomial = setup.getPolynomial()
	const getIndividualMoment = (skillId: string, exponent: number) => getBernsteinMoment(getCoefficients(skillId), exponent)
	const expectedValuePolynomial = substitutePolynomialMoments(polynomial, getIndividualMoment, polynomial.variables)
	return evaluatePolynomial(expectedValuePolynomial, {})
}

// Find E[x^0], ..., E[x^order].
function getSetupPowerExpectedValues(polynomial: Polynomial, getCoefficients: (skillId: string) => BernsteinCoefficients, order: number): number[] {
	const powers = getPolynomialPowers(polynomial, order)
	const moments = new Map<PolynomialVariable, Map<number, number>>(polynomial.variables.map(variable => [variable, new Map()]))
	const getMoment = (variable: PolynomialVariable, exponent: number): number => {
		const variableMoments = moments.get(variable)
		if (variableMoments === undefined) throw new Error(`Cannot get moment for unknown variable "${variable}".`)
		const cachedMoment = variableMoments.get(exponent)
		if (cachedMoment !== undefined) return cachedMoment
		const moment = getBernsteinMoment(getCoefficients(variable), exponent)
		variableMoments.set(exponent, moment)
		return moment
	}
	return powers.map(power => evaluatePolynomial(substitutePolynomialMoments(power, getMoment), {}))
}

// Find the distribution of a set-up using equation (23) from the PDT paper.
export function inferSetupCoefficients(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients, inferenceOrder = defaultInferenceOrder): BernsteinCoefficients {
	const order = ensureInteger(inferenceOrder, { nonNegative: true, safe: true })
	const powerExpectedValues = getSetupPowerExpectedValues(setup.getPolynomial(), getCoefficients, order)
	const coefficients = repeat(order + 1, index => {
		const expectedBasisPolynomial = repeat(order - index + 1, offset => (-1) ** offset * binomialCoefficient(order - index, offset) * powerExpectedValues[index + offset]).reduce((sum, term) => sum + term, 0)
		const coefficient = (order + 1) * binomialCoefficient(order, index) * expectedBasisPolynomial
		if (coefficient < 0 && coefficient > -1e-12) return 0
		if (coefficient < 0) throw new RangeError(`Could not infer setup coefficients: numerical instability produced the negative coefficient ${coefficient}. Try using a lower inference order.`)
		return coefficient
	})
	return normalizeBernsteinCoefficients(coefficients)
}

// Get the distributions of a skill based only on linked skills, one coefficient array per link.
function inferLinkCoefficients(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients[] {
	return (skill.links ?? []).map(link => {
		const smoothedCoefficients = link.skillIds.map(getCoefficients).map(coefficients => smoothBernsteinCoefficientsWithRetentionFactor(coefficients, link.correlation ?? defaultSkillLinkCorrelation))
		return multiplyBernsteinCoefficientsElementwise(...smoothedCoefficients)
	})
}

// Apply inference to a skill, based on the skill itself, its setup and linked skills.
export function inferSkillCoefficients(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients {
	const coefficientsToMerge = [
		getCoefficients(skill.id),
		...(skill.setup ? [inferSetupCoefficients(skill.setup, getCoefficients)] : []),
		...inferLinkCoefficients(skill, getCoefficients),
	]
	return multiplyBernsteinPDFs(...coefficientsToMerge)
}
