// SkillItemCombiner is an abstract class representing a combiner with a single skill which has something done to it. Combiners like "Repeat" and "Part" extend from it.

const { union } = require('../../../util/sets')

const { SkillCombiner } = require('./SkillCombiner')
const { ensureCombiner } = require('./ensureCombiner')

class SkillItemCombiner extends SkillCombiner {
	constructor(skill) {
		// Check that it is an instantiation.
		super()
		if (this.constructor === SkillItemCombiner)
			throw new Error(`Cannot instantiate abstract class SkillItemCombiner.`)

		// Ensure the input is a skill.
		this.skill = ensureCombiner(skill)
	}

	getSkillSet() {
		return this.skill.getSkillSet()
	}
}
module.exports.SkillItemCombiner = SkillItemCombiner
