const { ensureArray } = require('../../util')

const { skillTree } = require('../skillTree')

// ensureSkillId checks whether a skill ID exists and throws an error if it doesn't. If it doesn't precisely match a skill ID, it does a case insensitive match. It returns the correct skill ID. (An undefined skillId can be allowed if the second parameter is set to true, in which case it is passed through.)
function ensureSkillId(skillId, allowUndefined = false) {
	// Check input.
	if (skillId === undefined && allowUndefined)
		return undefined
	if (typeof skillId !== 'string')
		throw new Error(`Missing skill ID: expected a string but received something of type "${typeof skillId}".`)

	// Direct match?
	if (skillTree[skillId])
		return skillId

	// Case insensitive match?
	const skillIdLower = skillId.toLowerCase()
	const adjustedSkillId = Object.keys(skillTree).find(currSkillId => currSkillId.toLowerCase() === skillIdLower)
	if (adjustedSkillId)
		return adjustedSkillId

	// No match.
	throw new Error(`Unknown skill ID: expected the ID of an existing skill, but the skill ID "${skillId}" is not known in the skill tree.`)
}
module.exports.ensureSkillId = ensureSkillId

// ensureSkillIds does the same as ensureSkillIds, but then for an array.
function ensureSkillIds(skillIds, allowUndefined) {
	skillIds = ensureArray(skillIds)
	return skillIds.map(skillId => ensureSkillId(skillId, allowUndefined))
}
module.exports.ensureSkillIds = ensureSkillIds
