// SkillCombiner is the abstract parent class for all skill-combining classes. It has all the functionalities that need to be implemented by combiners.

const { repeat } = require('../../../util/functions')
const { binomial } = require('../../../util/combinatorics')

const { defaultInferenceOrder } = require('../../settings')
const { ensureCoef, ensureDataSet, normalize, getEV } = require('../../coefficients')
const { substituteAll, oneMinus, multiplyTwoWithEqualDimension, getPowerList, polynomialMatrixToString } = require('../../polynomials')

class SkillCombiner {
	constructor() {
		if (this.constructor === SkillCombiner)
			throw new Error(`Cannot instantiate abstract class SkillCombiner.`)
	}

	// Display functions.

	// toString gives a string representation of this combiner.
	toString() {
		throw new Error(`toString function is not implemented.`)
	}
	get str() {
		return this.toString()
	}

	// Properties.

	isDeterministic() {
		throw new Error(`isDeterministic function is not implemented.`)
	}

	// Skill retrieval functions.

	// getSkillSet returns a Set of all skills in this combiner, finding it recursively.
	getSkillSet() {
		throw new Error(`getSkillSet function is not implemented.`)
	}

	// getSkillList returns an array of all skills in this combiner. It filters out duplicates. There is no sorting.
	getSkillList() {
		return [...this.getSkillSet()]
	}

	// Functions revolving around the polynomial matrix.

	// getPolynomialMatrix gives the polynomial related to this combiner, in multi-dimensional matrix format. So "1 + 0b + 2a - ab" gives [[1, 0], [2, -1]].
	getPolynomialMatrix() {
		throw new Error(`getPolynomial function is not implemented.`)
	}

	// getPolynomialString gives the polynomial related to this combiner in string form. It uses the given skill names, unless useSkillNames is set to false, in which case letters a, b, c, ... are used.
	getPolynomialString(useSkillStrings = true) {
		if (this.getSkillList().length > 26)
			throw new Error(`Too many skills: cannot call displayPolynomial for skill combiners with more than 26 skills. There are not enough letters in the alphabet for this.`)
		const matrix = this.getPolynomialMatrix()
		return polynomialMatrixToString(matrix, useSkillStrings ? this.getSkillList() : undefined)
	}

	// getMatrixAndList returns both the matrix and the skill list as an object { matrix, list }
	getMatrixAndList() {
		return {
			matrix: this.getPolynomialMatrix(),
			list: this.getSkillList(),
		}
	}

	// Skill evaluation functions, given a data set.

	// getEV gets the expected value of this skill, given the distributions of all the skills, indicated by the data set. It gets the skill polynomial, takes the expected value of it (assuming independence) and returns the result.
	getEV(dataSet) {
		dataSet = ensureDataSet(dataSet)
		const { matrix, list } = this.getMatrixAndList()
		const skillCoefs = list.map(skillId => ensureCoef(dataSet[skillId]))
		const skillEVs = skillCoefs.map(coef => getEV(coef))
		return substituteAll(matrix, skillEVs)
	}

	// getDistribution returns a set of coefficients describing the distribution of this skill. The given order is the smoothing order applied while calculating this result.
	getDistribution(dataSet, n = defaultInferenceOrder) {
		// Process all the skill data.
		dataSet = ensureDataSet(dataSet)
		const { matrix, list } = this.getMatrixAndList()
		const skillCoefs = list.map(skillId => ensureCoef(dataSet[skillId]))
		const skillEVs = skillCoefs.map(coef => getEV(coef))

		// Find the coefficients of the final distribution.
		const powersOfMatrix = getPowerList(matrix, n)
		console.log(powersOfMatrix)
		const powersOfOneMinusMatrix = getPowerList(oneMinus(matrix), n)
		const coef = repeat(n + 1, i => {
			const newMatrix = multiplyTwoWithEqualDimension(powersOfMatrix[i], powersOfOneMinusMatrix[n - i]) // This is x^i*(1-x)^(n-i), as a polynomial matrix in the given skills.
			const EV = substituteAll(newMatrix, skillEVs) // This is the expected value of the said polynomial matrix.
			return (n + 1) * binomial(n, i) * EV // This is with the constant from the basis functions incorporated.
		})
		return normalize(coef)
	}
}
module.exports.SkillCombiner = SkillCombiner
