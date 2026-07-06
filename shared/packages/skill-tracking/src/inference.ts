import { repeat, getDimensions } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'
import { substituteIndividualMomentsIntoPolynomial, oneMinusPolynomial, multiplyPolynomials, getPolynomialPowerList } from '@step-wise/polynomials'
import type { SkillSetup } from '@step-wise/skill-setup'
import type { Skill } from '@step-wise/skill-definition'
import { type BernsteinCoefficients, getBernsteinMoment, normalizeBernsteinCoefficients, smoothBernsteinCoefficientsWithOrder, mergeBernsteinCoefficients, mergeBernsteinCoefficientsElementwise } from '@step-wise/bernstein-polynomials'

import { defaultInferenceOrder } from './settings'

// Find the expected value of a set-up.
export function getSetupExpectedValue(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients): number {
	const polynomial = setup.getPolynomialExpression()
	const coefficients = polynomial.list.map(skillId => getCoefficients(skillId))
	const getIndividualMoment = (index: number, exponent: number) => getBernsteinMoment(coefficients[index], exponent)
	return substituteIndividualMomentsIntoPolynomial(polynomial, getIndividualMoment, polynomial.list) as number
}

// Find the distribution of a set-up.
export function getSetupCoefficients(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients, inferenceOrder = defaultInferenceOrder): BernsteinCoefficients {
	// Note: the following lines are an approximation. Mathematically simple to calculate, but not accurate. It immediately inserts the expected values, instead of expanding the polynomial and using the respective moments.
	const expectedValue = getSetupExpectedValue(setup, getCoefficients)
	const coefficients = repeat(inferenceOrder + 1, i => (inferenceOrder + 1) * binomial(inferenceOrder, i) * expectedValue ** i * (1 - expectedValue) ** (inferenceOrder - i))
	return normalizeBernsteinCoefficients(coefficients)

	// // Find the coefficients of the skills in the polynomial.
	// const polynomial = setup.getPolynomialExpression()
	// const skillCoefficients = polynomial.list.map(skillId => getCoefficients(skillId))

	// // Precalculate the powers of the polynomial that will be used.
	// const powersOfPolynomial = getPolynomialPowerList(polynomial, inferenceOrder)
	// const powersOfOneMinusPolynomial = getPolynomialPowerList(oneMinusPolynomial(polynomial), inferenceOrder)

	// // Precalculate moments that will be needed within the calculation.
	// const dimensions = getDimensions(polynomial.matrix)
	// const moments = repeat(polynomial.list.length, index => {
	// 	const maxExponent = (dimensions[index] - 1) * inferenceOrder
	// 	return repeat(maxExponent + 1, exponent => getBernsteinMoment(skillCoefficients[index], exponent))
	// })
	// const getIndividualMoment = (index: number, exponent: number) => moments[index][exponent]

	// // Calculate each of the new coefficients.
	// const coefficients = repeat(inferenceOrder + 1, i => {
	// 	const basisPolynomial = multiplyPolynomials([powersOfPolynomial[i], powersOfOneMinusPolynomial[inferenceOrder - i]], polynomial.list)
	// 	const expectedBasisPolynomial = substituteIndividualMomentsIntoPolynomial(basisPolynomial, getIndividualMoment, polynomial.list) as number
	// 	return (inferenceOrder + 1) * binomial(inferenceOrder, i) * expectedBasisPolynomial
	// })
	// return normalizeBernsteinCoefficients(coefficients)
}

// Get the distributions of a skill based only on linked skills, one coefficient array per link.
function getLinkCoefficients(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients[] {
	return (skill.links ?? []).map(link => {
		const smoothedCoefficients = link.skills.map(getCoefficients).map(coefficients => smoothBernsteinCoefficientsWithOrder(coefficients, link.order))
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
