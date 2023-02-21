// Or is the combiner requiring the user to do ANY of the skills successfully for this skill to be successfully executed. You could argue that, if an exercise can be solved in multiple ways, than the maximum should be taken. But other methods can be used to check answers, requiring in a bonus. Hence using an Or operator can be argued to be appropriate.

const { SkillListCombiner } = require('../fundamentals/SkillListCombiner')
const { oneMinus, multiply } = require('../support/polynomialManipulation')

class Or extends SkillListCombiner {
	getPolynomialMatrix() {
		// Extract the skills lists and polynomials.
		const list = this.getSkillList()
		const lists = this.skills.map(skill => skill.getSkillList())
		const matrices = this.skills.map(skill => skill.getPolynomialMatrix())

		// Multiply the polynomials to get the result.
		return oneMinus(multiply(matrices.map(matrix => oneMinus(matrix)), lists, list).matrix)
	}
}
module.exports.Or = Or
