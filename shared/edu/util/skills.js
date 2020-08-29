const skills = require('../skills')

function includePrerequisites(skillIds) {
	const result = new Set()
	skillIds.forEach(skillId => {
		const skill = skills[skillId]
		if (!skill)
			throw new Error(`Unknown skill ID "${skillId}".`)
		result.add(skillId)
		skill.prerequisites.forEach(prerequisite => result.add(prerequisite))
	})
	return [...result]
}
module.exports.includePrerequisites = includePrerequisites