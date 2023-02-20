const { SkillCombiner } = require('./SkillCombiner')
const { Skill } = require('./Skill')

// ensureCombiner makes sure that the combiner it receives is a skill combiner. If not, it tries to turn it into one or throws an error otherwise.
function ensureCombiner(combiner) {
	// If it is a valid combiner, pass it on.
	if (combiner instanceof SkillCombiner)
		return combiner

	// If it is a string, ensure it's a basic Skill.
	if (typeof combiner === 'string')
		return new Skill(combiner)

	// Something is wrong.
	throw new Error(`Invalid skill: expected a skill or skill combiner, but received "${JSON.stringify(combiner)}".`)
}
module.exports.ensureCombiner = ensureCombiner
