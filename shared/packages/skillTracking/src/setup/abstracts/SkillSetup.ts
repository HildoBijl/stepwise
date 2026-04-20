import { fromKeys, pickKeys, sum, repeat } from '@step-wise/utils'
import { binomial } from '@step-wise/math-tools'

import { defaultInferenceOrder } from '../../settings'
import { type Coefficients, type CoefficientSet, ensureCoefficientSet, normalize, getExpectedValue as getCoefficientsExpectedValue, merge } from '../../coefficients'
import { type PolynomialExpression, type PolynomialMatrix, substitute, substituteAll, oneMinus, polynomialMatrixToString } from '../../polynomials'

export type SerializedSkillSetup<TValue = unknown, TType extends string = string> = { type: TType, value: TValue }

export abstract class SkillSetup<TStorageValue = unknown> {

	// Fundamentals.

	get type(): string {
		return this.constructor.name
	}

	abstract toStorageValue(): TStorageValue
	get SO(): TStorageValue { // SO legacy
		return this.toStorageValue()
	}

	serialize(): SerializedSkillSetup<TStorageValue> {
		return { type: this.type, value: this.toStorageValue() }
	}

	// Display functions.

	abstract toString(): string
	get str(): string {
		return this.toString()
	}

	// Properties.

	abstract isDeterministic(): boolean

	// Skill retrieval functions.

	// Get a Set of all skills in this set-up, finding it recursively.
	abstract getSkillSet(): Set<string>

	// Get an array of all skills in this set-up. Duplicates are filtered out. No sorting is applied.
	getSkillList(): string[] {
		return [...this.getSkillSet()]
	}

	// Functions revolving around the polynomial matrix.

	// Get the polynomial related to this set-up, in multi-dimensional matrix format.
	abstract getPolynomialMatrix(parent?: SkillSetup): PolynomialMatrix

	// Get the polynomial related to this set-up in string form.
	getPolynomialString(useSkillStrings = true): string {
		return polynomialMatrixToString(this.getPolynomialMatrix(), useSkillStrings ? this.getSkillList() : undefined)
	}

	// Get both the matrix and the skill list.
	getMatrixAndList(parent?: SkillSetup): PolynomialExpression {
		return {
			matrix: this.getPolynomialMatrix(parent),
			list: this.getSkillList(),
		}
	}

	// Skill evaluation functions, given a coefficient set.

	// Get the expected value of this skill, given the distributions of all subskills.
	getExpectedValue(coefficientSet: CoefficientSet, parent?: SkillSetup): number {
		const { matrix, list } = this.getMatrixAndList(parent)
		const ensuredCoefficientSet = ensureCoefficientSet(coefficientSet, list)
		const skillExpectedValues = list.map(skillId => ensuredCoefficientSet[skillId]).map(coefficients => getCoefficientsExpectedValue(coefficients))
		return substituteAll(matrix, skillExpectedValues)
	}

	// Get coefficients describing the distribution of this skill. The given order is the smoothing order applied while calculating this result.
	getDistribution(coefficientSet: CoefficientSet, order = defaultInferenceOrder, parent?: SkillSetup): Coefficients {
		const expectedValue = this.getExpectedValue(coefficientSet, parent)
		const coefficients = repeat(order + 1, i => (order + 1) * binomial(order, i) * expectedValue ** i * (1 - expectedValue) ** (order - i))
		return normalize(coefficients)

		// Note: the above code is mathematically incorrect. It immediately inserts the expected values, instead of expanding the polynomial and using the respective moments. The reason this is done is because this is computationally intensive and the difference is in most practical cases negligible.

		// const { matrix, list } = this.getMatrixAndList()
		// const skillCoefficients = list.map(skillId => ensureCoefficients(coefficientSet[skillId]))
		// const skillExpectedValues = skillCoefficients.map(coefficients => getExpectedValue(coefficients))
		// const powersOfMatrix = getPowerList(matrix, order)
		// const powersOfOneMinusMatrix = getPowerList(oneMinus(matrix), order)
		// const coefficients = repeat(order + 1, i => {
		// 	const newMatrix = multiplyTwoWithEqualDimension(powersOfMatrix[i], powersOfOneMinusMatrix[order - i])
		// 	const expectedValue = substituteAll(newMatrix, skillExpectedValues)
		// 	return (order + 1) * binomial(order, i) * expectedValue
		// })
		// return normalize(coefficients)
	}

	// Observation implementation functions.

	// Update skill coefficients based on an observation. Returns only adjusted skills.
	processObservation(coefficientSet: CoefficientSet, correct: boolean): CoefficientSet {
		// Check the input.
		if (!this.isDeterministic()) throw new Error(`Invalid observation processing: can only process observations of deterministic skills. The given skill set-up is a stochastic one.`)
		const skillIds = this.getSkillList()
		const ensuredCoefficientSet = ensureCoefficientSet(coefficientSet, skillIds)

		// Extract the polynomial matrix corresponding to this observation.
		const expectedValues = fromKeys(skillIds, skillId => getCoefficientsExpectedValue(ensuredCoefficientSet[skillId]))
		const polynomialMatrix = correct ? this.getPolynomialMatrix() : oneMinus(this.getPolynomialMatrix())

		// Apply the observation to the coefficients of each respective skill.
		return fromKeys(skillIds, skillId => {
			const skillsWithoutCurrent = skillIds.filter(currentSkillId => currentSkillId !== skillId)
			const filteredExpectedValues = pickKeys(expectedValues, skillsWithoutCurrent)
			const skillPolynomial = substitute(polynomialMatrix, skillIds, filteredExpectedValues).matrix as number[]

			const order = skillPolynomial.length - 1
			const shiftedCoefficients = repeat(order + 1, i => sum(repeat(i + 1, j => binomial(order - j, i - j) * skillPolynomial[j])) / binomial(order, i))

			return merge(shiftedCoefficients, ensuredCoefficientSet[skillId])
		})
	}
}
