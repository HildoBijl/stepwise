// SkillListCombiner is an abstract class representing a combiner with a list of skills. Combiners like "And" and "Or" extend from it.

const { union } = require('../../../../util/sets')

const { SkillCombiner } = require('./SkillCombiner')
const { ensureCombiner } = require('./ensureCombiner')

class SkillListCombiner extends SkillCombiner {
	constructor(...skills) {
		// Check that it is an instantiation.
		super()
		if (this.constructor === SkillListCombiner)
			throw new Error(`Cannot instantiate abstract class SkillListCombiner.`)

		// Ensure the input is an array of skills
		if (skills.length === 1)
			skills = skills[0]
		if (!Array.isArray(skills))
			skills = [skills]
		skills = skills.map(skill => ensureCombiner(skill))

		// Store the input.
		this.skills = skills
	}

	toString() {
		return `${this.constructor.name.toLowerCase()}(${this.skills.map(skill => skill.str).join(', ')})`
	}

	getSkillSet() {
		return union(...this.skills.map(skill => skill.getSkillSet()))
	}
}
module.exports.SkillListCombiner = SkillListCombiner
