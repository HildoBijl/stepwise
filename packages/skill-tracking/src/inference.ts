import { type Polynomial, type PolynomialCoefficients, substitutePolynomialMoments } from '@step-wise/polynomials'
import { type BernsteinCoefficients, getBernsteinMoment, multiplyBernsteinCoefficientsElementwise, multiplyBernsteinPDFs, normalizeBernsteinCoefficients, smoothBernsteinCoefficientsWithRetentionFactor } from '@step-wise/bernstein-polynomials'
import { ensureInteger, repeat } from '@step-wise/js-utils'
import { binomialCoefficient } from '@step-wise/math-tools'
import type { SkillSetup } from '@step-wise/skill-setup'
import type { Skill } from '@step-wise/skill-definition'

import { defaultInferenceOrder, defaultLinkCorrelation } from './settings'

// Find the expected value of a set-up.
export function getSetupExpectedValue(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients): number {
	const polynomial = setup.getPolynomial()
	const getIndividualMoment = (skillId: string, exponent: number) => getBernsteinMoment(getCoefficients(skillId), exponent)
	const expectedValuePolynomial = substitutePolynomialMoments(polynomial, getIndividualMoment, polynomial.variables)
	if (typeof expectedValuePolynomial.coefficients !== 'number') throw new TypeError('Expected substitution of all variables to produce a constant polynomial.')
	return expectedValuePolynomial.coefficients
}

type SparsePolynomialTerm = {
	exponents: number[]
	coefficient: number
}
type SparsePolynomial = SparsePolynomialTerm[]

// Convert a dense polynomial coefficient matrix to a list containing only its non-zero terms.
function getSparsePolynomial(polynomial: Polynomial): SparsePolynomial {
	const terms: SparsePolynomial = []
	const addTerms = (coefficients: PolynomialCoefficients, exponents: number[]): void => {
		if (typeof coefficients === 'number') {
			if (coefficients !== 0) terms.push({ exponents, coefficient: coefficients })
			return
		}
		coefficients.forEach((child, exponent) => addTerms(child, [...exponents, exponent]))
	}
	addTerms(polynomial.coefficients, [])
	return terms
}

// Multiply sparse polynomials. Both polynomials must use the same variables in the same order.
function multiplySparsePolynomials(polynomial1: SparsePolynomial, polynomial2: SparsePolynomial): SparsePolynomial {
	const terms = new Map<string, SparsePolynomialTerm>()
	polynomial1.forEach(term1 => {
		polynomial2.forEach(term2 => {
			const exponents = term1.exponents.map((exponent, index) => exponent + term2.exponents[index])
			const key = exponents.join(',')
			const coefficient = (terms.get(key)?.coefficient ?? 0) + term1.coefficient * term2.coefficient
			terms.set(key, { exponents, coefficient })
		})
	})
	return [...terms.values()].filter(term => term.coefficient !== 0)
}

// Find E[x^0], ..., E[x^order] without expanding dense multivariate coefficient matrices.
function getSetupPowerExpectedValues(polynomial: Polynomial, getCoefficients: (skillId: string) => BernsteinCoefficients, order: number): number[] {
	const sparsePolynomial = getSparsePolynomial(polynomial)
	const identity = [{ exponents: repeat(polynomial.variables.length, () => 0), coefficient: 1 }]
	const powers = [identity]
	for (let exponent = 1; exponent <= order; exponent++) powers.push(multiplySparsePolynomials(powers[exponent - 1], sparsePolynomial))

	const moments = polynomial.variables.map(() => new Map<number, number>())
	const getMoment = (variableIndex: number, exponent: number): number => {
		const cachedMoment = moments[variableIndex].get(exponent)
		if (cachedMoment !== undefined) return cachedMoment
		const moment = getBernsteinMoment(getCoefficients(polynomial.variables[variableIndex]), exponent)
		moments[variableIndex].set(exponent, moment)
		return moment
	}

	return powers.map(power => power.reduce((total, term) => total + term.coefficient * term.exponents.reduce((product, exponent, variableIndex) => product * getMoment(variableIndex, exponent), 1), 0))
}

// Find the distribution of a set-up using equation (23) from the PDT paper.
export function getSetupCoefficients(setup: SkillSetup, getCoefficients: (skillId: string) => BernsteinCoefficients, inferenceOrder = defaultInferenceOrder): BernsteinCoefficients {
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
function getLinkCoefficients(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients[] {
	return (skill.links ?? []).map(link => {
		const smoothedCoefficients = link.skillIds.map(getCoefficients).map(coefficients => smoothBernsteinCoefficientsWithRetentionFactor(coefficients, link.correlation ?? defaultLinkCorrelation))
		return multiplyBernsteinCoefficientsElementwise(...smoothedCoefficients)
	})
}

// Apply inference to a skill, based on the skill itself, its setup and linked skills.
export function applyInferenceForSkill(skill: Skill, getCoefficients: (skillId: string) => BernsteinCoefficients): BernsteinCoefficients {
	const coefficientsToMerge = [
		getCoefficients(skill.id),
		...(skill.setup ? [getSetupCoefficients(skill.setup, getCoefficients)] : []),
		...getLinkCoefficients(skill, getCoefficients),
	]
	return multiplyBernsteinPDFs(...coefficientsToMerge)
}
