// And is the operator requiring the user to do ALL of the skills successfully for this skill to be successfully executed.

const { union } = require('../../../util/sets')

const { SkillCombiner } = require('./SkillCombiner')
const { ensureCombiner } = require('./ensureCombiner')
const { multiply } = require('./support/polynomialManipulation')

class And extends SkillCombiner {
	constructor(...skills) {
		// Ensure the input is an array of skills
		if (skills.length === 1)
			skills = skills[0]
		if (!Array.isArray(skills))
			skills = [skills]
		skills = skills.map(skill => ensureCombiner(skill))

		// Store the input.
		super()
		this.skills = skills
	}

	toString() {
		return `and(${this.skills.map(skill => skill.str).join(', ')})`
	}

	getSkillSet() {
		return union(...this.skills.map(skill => skill.getSkillSet()))
	}

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
