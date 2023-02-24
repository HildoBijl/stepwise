const { SkillSetup } = require('./SkillSetup')
const { Skill } = require('./Skill')

// ensureSetup makes sure that the set-up it receives is a skill set-up. If not, it tries to turn it into one or throws an error otherwise.
function ensureSetup(setup) {
	// If it is a valid set-up, pass it on.
	if (setup instanceof SkillSetup)
		return setup

	// If it is a string, ensure it's a basic Skill.
	if (typeof setup === 'string')
		return new Skill(setup)

	// Something is wrong.
	throw new Error(`Invalid skill: expected a skill or skill set-up, but received "${JSON.stringify(setup)}".`)
}
module.exports.ensureSetup = ensureSetup
