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

// processSkill turns a skill object from database form to a more usable form.
function processSkill(skill) {
	return { // Extract required data. (And not all the other stuff that sequelize attaches.)
		id: skill.id,
		skillId: skill.skillId,
		numPracticed: skill.numPracticed,
		coefficients: skill.coefficients,
		coefficientsOn: new Date(skill.coefficientsOn), // Give extra functionalities.
		highest: skill.coefficients,
		highestOn: new Date(skill.highestOn), // Give extra functionalities.
	}
}
module.exports.processSkill = processSkill

// getDefaultSkillData gives the skill data that we use when the database does not contain a certain skill. It's already in processed form.
function getDefaultSkillData(skillId) {
	return {
		skillId,
		numPracticed: 0,
		coefficients: [1],
		coefficientsOn: new Date(),
		highest: [1],
		highestOn: new Date(),
	}
}
module.exports.getDefaultSkillData = getDefaultSkillData

// getDifficulty takes a data object and returns the difficulty.
function getDifficulty(data) {
	return data.setup || data.skill
}
module.exports.getDifficulty = getDifficulty