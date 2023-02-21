// And is the combiner requiring the user to do ALL of the skills successfully for this skill to be successfully executed.

const { SkillListCombiner } = require('../fundamentals/SkillListCombiner')
const { multiply } = require('../support/polynomialManipulation')

class And extends SkillListCombiner {
	getPolynomialMatrix() {
		// Extract the skills lists and polynomials.
		const list = this.getSkillList()
		const lists = this.skills.map(skill => skill.getSkillList())
		const matrices = this.skills.map(skill => skill.getPolynomialMatrix())

		// Multiply the polynomials to get the result.
		return multiply(matrices, lists, list).matrix
	}
}
module.exports.And = And
