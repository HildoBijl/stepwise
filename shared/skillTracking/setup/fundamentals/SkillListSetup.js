// SkillListSetup is an abstract class representing a set-up with a list of skills. Set-ups like "And" and "Or" extend from it.

const { union } = require('../../../util')

const { SkillSetup } = require('./SkillSetup')
const { ensureSetup } = require('./ensureSetup')

class SkillListSetup extends SkillSetup {
	constructor(...skills) {
		// Check that it is an instantiation.
		super()
		if (this.constructor === SkillListSetup)
			throw new Error(`Cannot instantiate abstract class SkillListSetup.`)

		// Ensure the input is an array of skills
		if (skills.length === 1)
			skills = skills[0]
		if (!Array.isArray(skills))
			skills = [skills]
		if (skills.length === 0)
			throw new Error(`Invalid skills list: expected at least one skill.`)
		skills = skills.map(skill => ensureSetup(skill))

		// Store the input.
		this.skills = skills
	}

	get SO() {
		return { ...super.SO, skills: this.skills.map(skill => skill.SO) }
	}
	static fromSO(SO, objToSetup) {
		return new this(...SO.skills.map(skill => objToSetup(skill)))
	}

	isDeterministic() {
		return this.skills.every(skill => skill.isDeterministic())
	}

	toString() {
		return `${this.constructor.name.toLowerCase()}(${this.skills.map(skill => skill.str).join(', ')})`
	}

	getSkillSet() {
		return union(...this.skills.map(skill => skill.getSkillSet()))
	}
}
module.exports.SkillListSetup = SkillListSetup
