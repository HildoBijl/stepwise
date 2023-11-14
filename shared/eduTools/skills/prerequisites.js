const { skillTree } = require('../skillTree')

const { ensureSkillIds } = require('./checks')

// includePrerequisites takes a list of skillIds and returns a new list of skillIds: all given skillIds plus the prerequisites of these skillIds.
function includePrerequisites(skillIds) {
	const result = new Set()
	skillIds = ensureSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skillTree[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
	})
	return [...result]
}
module.exports.includePrerequisites = includePrerequisites

// includePrerequisites takes a list of skillIds and returns a new list of skillIds: all given skillIds plus the prerequisites of these skillIds as well as linked/correlated skills.
function includePrerequisitesAndLinks(skillIds) {
	const result = new Set()
	skillIds = ensureSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skillTree[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
		skillTree[skillId].linkedSkills.forEach(linkedSkill => result.add(linkedSkill))
	})
	return [...result]
}
module.exports.includePrerequisitesAndLinks = includePrerequisitesAndLinks
