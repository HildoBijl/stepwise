// SkillCombiner is the abstract parent class for all skill-combining classes. It has all the functionalities that need to be implemented by combiners.

const { polynomialMatrixToString } = require('../support/polynomialDisplay')

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

	// Skill retrieval functions.

	// getSkillSet returns a Set of all skills in this combiner, finding it recursively.
	getSkillSet() {
		throw new Error(`getSkillSet function is not implemented.`)
	}

	// getSkillList returns an array of all skills in this combiner. It filters out duplicates. There is no sorting.
	getSkillList() {
		return [...this.getSkillSet()]
	}

	// Skill calculation functions.

	// getPolynomialMatrix gives the polynomial related to this combiner, in multi-dimensional matrix format. So "1 + 0b + 2a - ab" gives [[1, 0], [2, -1]].
	getPolynomialMatrix() {
		throw new Error(`getPolynomial function is not implemented.`)
	}

	// getPolynomialString gives the polynomial related to this combiner in string form. It uses the given skill names, unless useSkillNames is set to false, in which case letters a, b, c, ... are used.
	getPolynomialString(useSkillStrings = false) {
		if (this.getSkillList().length > 26)
			throw new Error(`Too many skills: cannot call displayPolynomial for skill combiners with more than 26 skills. There are not enough letters in the alphabet for this.`)
		const matrix = this.getPolynomialMatrix()
		return polynomialMatrixToString(matrix, useSkillStrings ? this.getSkillList() : undefined)
	}
}
module.exports.SkillCombiner = SkillCombiner
