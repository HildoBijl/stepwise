// Pick is the combiner in which a user has to do a number of skill randomly selected from a larger set of skills.

const { ensureInt } = require('../../../util/numbers')
const { ensureNumberArray, sum, product, getMatrixElement } = require('../../../util/arrays')
const { repeatMultidimensional } = require('../../../util/functions')

const { multiplyByConstant, addWithEqualDimension, multiply } = require('../support')
const { SkillListCombiner } = require('../fundamentals')

class Pick extends SkillListCombiner {
	constructor(skills, number = 1, weights) {
		// Store the skills in the default way.
		super(skills)

		// Check and store the number.
		this.number = ensureInt(number, true, true)
		if (number >= skills.length)
			throw new Error(`Invalid Pick number: expected a number of picked skills smaller than the given number of skills (${skills.length}) but a number "${number}" was given.`)

		// Check and store the weights.
		if (weights === undefined)
			weights = skills.map(_ => 1) // On no weights given, use 1 everywhere.
		this.weights = ensureNumberArray(weights, true, true)
	}

	getPolynomialMatrix() {
		// Walk through all options (like [0,1], [0,2], [0,3], [1,2], [1,3] and [2,3]) to determine their weights.
		const repeatList = new Array(this.number).fill(this.skills.length)
		const weights = repeatMultidimensional(repeatList, (...option) => {
			if (option.some((value, index) => index > 0 && value <= option[index - 1]))
				return 0 // Ignore options that are not strictly ascending.
			return product(option.map(index => this.weights[index])) // The weight of the option is proportional to the product of the individual weights of the skills.
		})
		const sumOfWeights = sum(weights.flat(this.number - 1))

		// Determine lists and matrices for the individual skills and everything together.
		const skillMatrices = this.skills.map(skill => skill.getPolynomialMatrix())
		const skillLists = this.skills.map(skill => skill.getSkillList())
		const list = this.getSkillList()

		// Walk through all options and get the probability polynomial for each option. Make sure the respective matrices are all subject to the same variable list.
		const matrices = repeatMultidimensional(repeatList, (...option) => {
			const weight = getMatrixElement(weights, option)
			if (weight === 0)
				return
			const matrix = multiply(option.map(index => skillMatrices[index]), option.map(index => skillLists[index]), list).matrix
			return multiplyByConstant(matrix, weight / sumOfWeights)
		})

		// Add all the matrices.
		const matricesFlat = matrices.flat(this.number - 1).filter(element => element !== undefined)
		return addWithEqualDimension(matricesFlat)
	}
}
module.exports.Pick = Pick

module.exports.pick = (...args) => new Pick(...args)
