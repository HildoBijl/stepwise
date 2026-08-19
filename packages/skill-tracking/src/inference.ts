import { repeat, getDimensions } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import { substitutePolynomialMoments, oneMinusPolynomial, multiplyPolynomials, getPolynomialPowers } from '@step-wise/polynomials'
import type { SkillSetup } from '@step-wise/skill-setup'
import type { Skill } from '@step-wise/skill-definition'
import { type BernsteinCoefficients, getBernsteinMoment, normalizeBernsteinCoefficients, smoothBernsteinCoefficientsWithFactor, mergeBernsteinCoefficients, mergeBernsteinCoefficientsElementwise } from '@step-wise/bernstein-polynomials'

import { defaultInferenceOrder, defaultLinkCorrelation } from './settings'

// Find the expected value of a set-up.
export function getSetupExpectedValue(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients): number {
	const polynomial = setup.getPolynomial()
	const getIndividualMoment = (skillId: string, exponent: number) => getBernsteinMoment(getCoefficients(skillId), exponent)
	const expectedValuePolynomial = substitutePolynomialMoments(polynomial, getIndividualMoment, polynomial.variables)
	if (typeof expectedValuePolynomial.coefficients !== 'number') throw new TypeError('Expected substitution of all variables to produce a constant polynomial.')
	return expectedValuePolynomial.coefficients
}

// Find the distribution of a set-up.
export function getSetupCoefficients(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients, inferenceOrder = defaultInferenceOrder): BernsteinCoefficients {
	// Note: the following lines are an approximation. Mathematically simple to calculate, but not accurate. It immediately inserts the expected values, instead of expanding the polynomial and using the respective moments.
	const expectedValue = getSetupExpectedValue(setup, getCoefficients)
	const coefficients = repeat(inferenceOrder + 1, i => (inferenceOrder + 1) * binomialCoefficient(inferenceOrder, i) * expectedValue ** i * (1 - expectedValue) ** (inferenceOrder - i))
	return normalizeBernsteinCoefficients(coefficients)

	// // Find the coefficients of the skills in the polynomial.
	// const polynomial = setup.getPolynomial()
	// const skillCoefficients = polynomial.variables.map(skillId => getCoefficients(skillId))

	// // Precalculate the powers of the polynomial that will be used.
	// const powersOfPolynomial = getPolynomialPowers(polynomial, inferenceOrder)
	// const powersOfOneMinusPolynomial = getPolynomialPowers(oneMinusPolynomial(polynomial), inferenceOrder)

	// // Precalculate moments that will be needed within the calculation.
	// const dimensions = getDimensions(polynomial.coefficients)
	// const moments = repeat(polynomial.variables.length, index => {
	// 	const maxExponent = (dimensions[index] - 1) * inferenceOrder
	// 	return repeat(maxExponent + 1, exponent => getBernsteinMoment(skillCoefficients[index], exponent))
	// })
	// const getIndividualMoment = (index: number, exponent: number) => moments[index][exponent]

	// // Calculate each of the new coefficients.
	// const coefficients = repeat(inferenceOrder + 1, i => {
	// 	const basisPolynomial = multiplyPolynomials([powersOfPolynomial[i], powersOfOneMinusPolynomial[inferenceOrder - i]], polynomial.variables)
	// 	const expectedBasisPolynomial = substitutePolynomialMoments(basisPolynomial, getIndividualMoment, polynomial.variables) as number
	// 	return (inferenceOrder + 1) * binomialCoefficient(inferenceOrder, i) * expectedBasisPolynomial
	// })
	// return normalizeBernsteinCoefficients(coefficients)
}

// Get the distributions of a skill based only on linked skills, one coefficient array per link.
function getLinkCoefficients(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients[] {
	return (skill.links ?? []).map(link => {
		const smoothedCoefficients = link.skills.map(getCoefficients).map(coefficients => smoothBernsteinCoefficientsWithFactor(coefficients, link.correlation ?? defaultLinkCorrelation))
		return mergeBernsteinCoefficientsElementwise(...smoothedCoefficients)
	})
}

// Apply inference to a skill, based on the skill itself, its setup and linked skills.
export function applyInferenceForSkill(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients {
	const coefficientsToMerge = [
		getCoefficients(skill.id),
		...(skill.setup ? [getSetupCoefficients(skill.setup, getCoefficients)] : []),
		...getLinkCoefficients(skill, getCoefficients),
	]
	return mergeBernsteinCoefficients(...coefficientsToMerge)
}
