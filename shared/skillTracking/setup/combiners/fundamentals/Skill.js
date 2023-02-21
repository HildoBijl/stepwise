// Skill is the most basic skill. It just represents a single skill.

const { SkillCombiner } = require('./SkillCombiner')

class Skill extends SkillCombiner {
	constructor(skill) {
		// Check input.
		if (typeof skill !== 'string')
			throw new Error(`Invalid skill: expected a string but received something of type "${typeof skill}" with value "${JSON.stringify(skill)}".`)

		// Store input.
		super()
		this.skill = skill
	}

	toString() {
		return `"${this.skill}"`
	}

	getSkillSet() {
		return new Set([this.skill])
	}

	getPolynomialMatrix() {
		return [0, 1] // x
	}
}
module.exports.Skill = Skill
