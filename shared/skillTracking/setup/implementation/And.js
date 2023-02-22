// And is the combiner requiring the user to do ALL of the skills successfully for this skill to be successfully executed.

const { multiply } = require('../../polynomials')

const { SkillListCombiner } = require('../fundamentals')

class And extends SkillListCombiner {
	isDeterministic() {
		return true
	}

	getPolynomialMatrix() {
		// Extract the skills lists and polynomials.
		const list = this.getSkillList()
		const lists = this.skills.map(skill => skill.getSkillList())
		const matrices = this.skills.map(skill => skill.getPolynomialMatrix(this))

		// Multiply the polynomials to get the result.
		return multiply(matrices, lists, list).matrix
	}
}
module.exports.And = And

module.exports.and = (...skills) => new And(...skills)
