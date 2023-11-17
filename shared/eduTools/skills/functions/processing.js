// processSkill turns a skill object from database form to a more usable form, for instance turning Date strings into Date objects and removing superfluous parameters.
function processSkill(skill) {
	return { // Extract required data. (And not all the other stuff that sequelize attaches.)
		id: skill.id, // The ID in the database.
		skillId: skill.skillId, // The actual skillID as defined in the skillTree.
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
