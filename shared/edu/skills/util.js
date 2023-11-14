const { ensureArray } = require('../../util')
const { ensureSetup } = require('../../skillTracking')

const { skillTree } = require('../../eduTools')

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

// processSkill turns a skill object from database form to a more usable form.
function processSkill(skill) {
	return { // Extract required data. (And not all the other stuff that sequelize attaches.)
		id: skill.id,
		skillId: skill.skillId,
		numPracticed: skill.numPracticed,
		coefficients: skill.coefficients,
		coefficientsOn: new Date(skill.coefficientsOn), // Give extra functionalities.
		highest: skill.highest,
		highestOn: new Date(skill.highestOn), // Give extra functionalities.
		createdAt: new Date(skill.createdAt), // Give extra functionalities.
		updatedAt: new Date(skill.updatedAt), // Give extra functionalities.
	}
}
module.exports.processSkill = processSkill

// getDefaultSkillData gives the skill data that we use when the database does not contain a certain skill. It's already in processed form.
function getDefaultSkillData(skillId) {
	const now = new Date()
	return {
		skillId,
		numPracticed: 0,
		coefficients: [1],
		coefficientsOn: now,
		highest: [1],
		highestOn: now,
		createdAt: now,
		updatedAt: now,
	}
}
module.exports.getDefaultSkillData = getDefaultSkillData

// getDifficulty takes a data object and returns the difficulty, in the form of a setup object.
function getDifficulty(data) {
	return ensureSetup(data.setup || data.skill)
}
module.exports.getDifficulty = getDifficulty