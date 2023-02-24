// SkillItemSetup is an abstract class representing a set-up with a single skill which has something done to it. Set-ups like "Repeat" and "Part" extend from it.

const { SkillSetup } = require('./SkillSetup')
const { ensureSetup } = require('./ensureSetup')

class SkillItemSetup extends SkillSetup {
	constructor(skill) {
		// Check that it is an instantiation.
		super()
		if (this.constructor === SkillItemSetup)
			throw new Error(`Cannot instantiate abstract class SkillItemSetup.`)

		// Ensure the input is a skill.
		this.skill = ensureSetup(skill)
	}

	isDeterministic() {
		return this.skill.isDeterministic()
	}

	getSkillSet() {
		return this.skill.getSkillSet()
	}
}
module.exports.SkillItemSetup = SkillItemSetup
