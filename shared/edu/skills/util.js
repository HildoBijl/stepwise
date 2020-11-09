const skills = require('./index')

function includePrerequisites(skillIds) {
	const result = new Set()
	skillIds = processSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skills[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
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

// processSkillId checks whether a skill ID exists and throws an error if it doesn't. If it doesn't precisely match a skill ID, it does a case insensitive match. It returns the correct skill ID. (An undefined skillId is allowed and passed through.)
function processSkillId(skillId) {
	// Check input.
	if (skillId === undefined)
		return undefined
	if (typeof skillId !== 'string')
		throw new Error(`Missing skill ID. Expected a string but received "${skillId}".`)

	// Direct match?
	if (skills[skillId])
		return skillId

	// Case insensitive match?
	const skillIdLower = skillId.toLowerCase()
	const adjustedSkillId = Object.keys(skills).find(currSkillId => currSkillId.toLowerCase() === skillIdLower)
	if (adjustedSkillId)
		return adjustedSkillId

	// No match.
	throw new Error(`Unknown skill ID "${skillId}".`)
}
module.exports.processSkillId = processSkillId

// processSkillIds does the same as processSkillId, but then for an array.
function processSkillIds(skillIds) {
	return skillIds.map(processSkillId)
}
module.exports.processSkillIds = processSkillIds

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