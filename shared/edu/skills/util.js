import skills from './index'

export function includePrerequisites(skillIds) {
	const result = new Set()
	skillIds = processSkillIds(skillIds)
	skillIds.forEach(skillId => {
		result.add(skillId)
		skills[skillId].prerequisites.forEach(prerequisite => result.add(prerequisite))
	})
	return [...result]
}

// processSkill turns a skill object from database form to a more usable form.
export function processSkill(skill) {
	return { // Extract required data. (And not all the other stuff that sequelize attaches.)
		id: skill.id,
		skillId: skill.skillId,
		numPracticed: skill.numPracticed,
		coefficients: skill.coefficients,
		coefficientsOn: new Date(skill.coefficientsOn), // Give extra functionalities.
		highest: skill.highest,
		highestOn: new Date(skill.highestOn), // Give extra functionalities.
	}
}

// processSkillId checks whether a skill ID exists and throws an error if it doesn't. If it doesn't precisely match a skill ID, it does a case insensitive match. It returns the correct skill ID. (An undefined skillId is allowed and passed through.)
export function processSkillId(skillId) {
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

// processSkillIds does the same as processSkillId, but then for an array.
export function processSkillIds(skillIds) {
	return skillIds.map(processSkillId)
}

// getDefaultSkillData gives the skill data that we use when the database does not contain a certain skill. It's already in processed form.
export function getDefaultSkillData(skillId) {
	return {
		skillId,
		numPracticed: 0,
		coefficients: [1],
		coefficientsOn: new Date(),
		highest: [1],
		highestOn: new Date(),
	}
}

// getDifficulty takes a data object and returns the difficulty.
export function getDifficulty(data) {
	return data.setup || data.skill
}
