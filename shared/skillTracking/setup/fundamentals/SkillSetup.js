// SkillSetup is the abstract parent class for all skill-set-up classes. It has all the functionalities that need to be implemented by set-ups.

const { ensureBoolean, keysToObject, filterProperties, sum, repeat, binomial } = require('../../../util')

const { defaultInferenceOrder } = require('../../settings')
const { ensureCoef, ensureCoefSet, normalize, getEV, mergeTwo } = require('../../coefficients')
const { substitute, substituteAll, oneMinus, polynomialMatrixToString } = require('../../polynomials')

class SkillSetup {
	constructor() {
		if (this.constructor === SkillSetup)
			throw new Error(`Cannot instantiate abstract class SkillSetup.`)
	}

	// Display functions.

	// toString gives a string representation of this set-up.
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

	// getSkillSet returns a Set of all skills in this set-up, finding it recursively.
	getSkillSet() {
		throw new Error(`getSkillSet function is not implemented.`)
	}

	// getSkillList returns an array of all skills in this set-up. It filters out duplicates. There is no sorting.
	getSkillList() {
		return [...this.getSkillSet()]
	}

	// Functions revolving around the polynomial matrix.

	// getPolynomialMatrix gives the polynomial related to this set-up, in multi-dimensional matrix format. So "1 + 0b + 2a - ab" gives [[1, 0], [2, -1]].
	getPolynomialMatrix() {
		throw new Error(`getPolynomial function is not implemented.`)
	}

	// getPolynomialString gives the polynomial related to this set-up in string form. It uses the given skill names, unless useSkillNames is set to false, in which case letters a, b, c, ... are used.
	getPolynomialString(useSkillStrings = true) {
		return polynomialMatrixToString(this.getPolynomialMatrix(), useSkillStrings ? this.getSkillList() : undefined)
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
	getEV(coefSet) {
		coefSet = ensureCoefSet(coefSet)
		const { matrix, list } = this.getMatrixAndList()
		const skillCoefs = list.map(skillId => ensureCoef(coefSet[skillId]))
		const skillEVs = skillCoefs.map(coef => getEV(coef))
		return substituteAll(matrix, skillEVs)
	}

	// getDistribution returns a set of coefficients describing the distribution of this skill. The given order is the smoothing order applied while calculating this result.
	getDistribution(coefSet, n = defaultInferenceOrder) {
		// Get the EV, insert it into the polynomial, and use the basis functions to get the coefficients.
		const EV = this.getEV(coefSet)
		const coef = repeat(n + 1, i => (n + 1) * binomial(n, i) * (EV ** i) * (1 - EV) ** (n - i))
		return normalize(coef)

		// Note: the above code is mathematically incorrect. It immediately inserts the expected values, instead of expanding the polynomial and using the respective moments. The reason this is done (through the code below) is because this is computationally intensive and the difference is in most practical cases negligible.

		// // Process all the skill data.
		// coefSet = ensureCoefSet(coefSet)
		// const { matrix, list } = this.getMatrixAndList()
		// const skillCoefs = list.map(skillId => ensureCoef(coefSet[skillId]))
		// const skillEVs = skillCoefs.map(coef => getEV(coef))
		//
		// // Find the coefficients of the final distribution.
		// const powersOfMatrix = getPowerList(matrix, n)
		// const powersOfOneMinusMatrix = getPowerList(oneMinus(matrix), n)
		// const coef = repeat(n + 1, i => {
		// 	const newMatrix = multiplyTwoWithEqualDimension(powersOfMatrix[i], powersOfOneMinusMatrix[n - i]) // This is x^i*(1-x)^(n-i), as a polynomial matrix in the given skills.
		// 	const EV = substituteAll(newMatrix, skillEVs) // This is the expected value of the said polynomial matrix.
		// 	return (n + 1) * binomial(n, i) * EV // This is with the constant from the basis functions incorporated.
		// })
		// return normalize(coef)
	}

	// Observation implementation functions.

	// processObservation is the main function to update skill coefficients. It is given a coefficient set, as well as a boolean to indicate whether this skill set-up has been correctly or incorrectly performed. The function then checks all skills related to this set-up and updates them accordingly. An adjusted coefficient set with only adjusted skills is returned. The calling function can then, if desired, merge this into the full coefficient set.
	processObservation(coefSet, correct) {
		// Check input.
		correct = ensureBoolean(correct)
		if (!this.isDeterministic())
			throw new Error(`Invalid observation processing: can only process observations of deterministic skills. The given skill set-up is a stochastic one.`)
		const skills = this.getSkillList()
		coefSet = ensureCoefSet(coefSet, skills)

		// Gather general data.
		const EVs = keysToObject(skills, skill => getEV(coefSet[skill]))
		let polynomialMatrix = this.getPolynomialMatrix()
		polynomialMatrix = correct ? polynomialMatrix : oneMinus(polynomialMatrix)

		// Walk through the skill list and perform the update.
		return keysToObject(skills, skill => {
			// Find the expected value of the skill polynomial with as only remaining parameter remaining the current skill.
			const skillsWithoutCurrent = skills.filter(currSkill => currSkill !== skill)
			const filteredEVs = filterProperties(EVs, skillsWithoutCurrent)
			const skillPolynomial = substitute(polynomialMatrix, skills, filteredEVs).matrix

			// Shift the coefficients of the polynomial to the basis coefficients of a skill PDF.
			const n = skillPolynomial.length - 1
			const shiftedCoefficients = repeat(n + 1, i => sum(repeat(i + 1, j => binomial(n - j, i - j) * skillPolynomial[j])) / binomial(n, i))

			// Merge the two coefficient sets together.
			const oldCoefs = coefSet[skill]
			return mergeTwo(shiftedCoefficients, oldCoefs)
		})
	}
}
module.exports.SkillSetup = SkillSetup
