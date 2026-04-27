const { skillTree } = require('../skillTree')

const { ensureSkillIds } = require('./checks')

// includeDirectPrerequisites takes a list of skillIds and returns a new list of skillIds: all given skillIds plus the prerequisites of these skillIds.
function includeDirectPrerequisites(skillIds) {
	const result = new Set()
	skillIds = ensureSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skillTree[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
	})
	return [...result]
}
module.exports.includeDirectPrerequisites = includeDirectPrerequisites

// includeDirectPrerequisites takes a list of skillIds and returns a new list of skillIds: all given skillIds plus the prerequisites of these skillIds as well as linked/correlated skills.
function includeDirectPrerequisitesAndLinks(skillIds) {
	const result = new Set()
	skillIds = ensureSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skillTree[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
		skillTree[skillId].linkedSkills.forEach(linkedSkill => result.add(linkedSkill))
	})
	return [...result]
}
module.exports.includeDirectPrerequisitesAndLinks = includeDirectPrerequisitesAndLinks
