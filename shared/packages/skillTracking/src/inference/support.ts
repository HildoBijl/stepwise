import { fromKeys, repeat } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'
import { substituteIntoPolynomial } from '@step-wise/polynomials'
// import { substituteIntoPolynomial, oneMinusPolynomial, multiplyPolynomials, getPolynomialPowerList } from '@step-wise/polynomials'
import { type BernsteinCoefficients, getBernsteinExpectedValue, normalizeBernsteinCoefficients, smoothBernsteinCoefficientsWithOrder, mergeBernsteinCoefficients, mergeBernsteinCoefficientsElementwise } from '@step-wise/bernstein-polynomials'
import { type SkillSetup } from '@step-wise/skill-setup'

import { defaultInferenceOrder } from '../settings'

import { type SkillLike } from './types'

// Find the expected value of a set-up.
export function getSetupExpectedValue(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients): number {
	const polynomial = setup.getPolynomialExpression()
	const expectedValues = fromKeys(polynomial.list, skillId => getBernsteinExpectedValue(getCoefficients(skillId)))
	return substituteIntoPolynomial(polynomial, expectedValues) as number
}

// Find the distribution of a set-up.
function getSetupCoefficients(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients, inferenceOrder = defaultInferenceOrder): BernsteinCoefficients {
	const expectedValue = getSetupExpectedValue(setup, getCoefficients)
	const coefficients = repeat(inferenceOrder + 1, i => (inferenceOrder + 1) * binomial(inferenceOrder, i) * expectedValue ** i * (1 - expectedValue) ** (inferenceOrder - i))
	return normalizeBernsteinCoefficients(coefficients)
	
	// Note: the above code is mathematically incorrect. It immediately inserts the expected values, instead of expanding the polynomial and using the respective moments. The reason this is done is because this is computationally intensive and the difference is in most practical cases negligible.
	
	// const polynomial = setup.getPolynomialExpression()
	// const coefficientSet = fromKeys(polynomial.list, getCoefficients)
	// const expectedValues = fromKeys(polynomial.list, skillId => getBernsteinExpectedValue(coefficientSet[skillId]))
	// const powersOfPolynomial = getPolynomialPowerList(polynomial, inferenceOrder)
	// const powersOfOneMinusPolynomial = getPolynomialPowerList(oneMinusPolynomial(polynomial), inferenceOrder)
	// const coefficients = repeat(inferenceOrder + 1, i => {
	// 	const newPolynomial = multiplyPolynomials([powersOfPolynomial[i], powersOfOneMinusPolynomial[inferenceOrder - i]])
	// 	const expectedValue = substituteIntoPolynomial(newPolynomial, expectedValues) as number
	// 	return (inferenceOrder + 1) * binomial(inferenceOrder, i) * expectedValue
	// })
	// return normalizeBernsteinCoefficients(coefficients)
}

// Get the distributions of a skill based only on linked skills, one coefficient array per link.
function getLinkCoefficients(skill: SkillLike, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients[] {
	return (skill.links ?? []).map(link => {
		const rawCoefficients = link.skills.map(getCoefficients)
		const smoothedCoefficients = rawCoefficients.map(coefficients => smoothBernsteinCoefficientsWithOrder(coefficients, link.order))
		return mergeBernsteinCoefficientsElementwise(...smoothedCoefficients)
	})
}

// Apply inference to a skill, based on the skill itself, its setup and linked skills.
export function applyInferenceForSkill(skill: SkillLike, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients {
	const ownCoefficients = getCoefficients(skill.id)
	const setupCoefficients = skill.setup ? getSetupCoefficients(skill.setup, getCoefficients) : undefined
	const linkCoefficients = getLinkCoefficients(skill, getCoefficients)
	return mergeBernsteinCoefficients(...[ownCoefficients, ...(setupCoefficients ? [setupCoefficients] : []), ...linkCoefficients])
}
