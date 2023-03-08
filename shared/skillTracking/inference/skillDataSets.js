const { applyToEachParameter } = require('../../util/objects')

const { SkillData } = require('./SkillData')

// processSkillDataSet takes a raw skill data set, loaded from the database, and the skill tree. It sets up a functional skill data set.
function processSkillDataSet(rawSkillDataSet, skillTree) {
	return updateSkillDataSet({}, rawSkillDataSet, skillTree) // Pass on to the update function, starting with an empty data set.
}
module.exports.processSkillDataSet = processSkillDataSet

// updateSkillDataSet takes an already existing skillDataSet, a new raw skill data set (possibly containing only a subset of the already known skills) and the usual skill tree. It then incorporates the new data into the skill data set. It returns a copy of the skill data set. (An exception occurs when the data is not new: then the existing skill data set is returned.)
function updateSkillDataSet(skillDataSet, newRawSkillDataSet, skillTree) {
	// Define a handler that determines if a skill requires updating.
	const shouldUpdateSkill = (skillId) => {
		// If there is no data on the skill yet, definitely update it.
		const currentSkillData = skillDataSet[skillId]
		if (!currentSkillData)
			return true

		// If the new data is more recent/extensive than the currently existing data, also update it.
		const rawSkillData = newRawSkillDataSet[skillId]
		if (currentSkillData.coefficientsOn.getTime() < rawSkillData.coefficientsOn.getTime() || currentSkillData.numPracticed < rawSkillData.numPracticed)
			return true

		// No reason has be found to update. Do not update.
		return false
	}

	// First check if an update is needed. If not, return the existing data set.
	const shouldApplyUpdate = Object.keys(newRawSkillDataSet).some(skillId => shouldUpdateSkill(skillId))
	if (!shouldApplyUpdate)
		return skillDataSet

	// An update is needed. Clone the data set and apply updates.
	const newSkillDataSet = applyToEachParameter(skillDataSet, (skillData, skillId, obj) => skillData.cloneForSkillDataSet(obj))
	Object.keys(newRawSkillDataSet).forEach(skillId => {
		// If the skill ID does not exist, throw an error.
		const skill = skillTree[skillId]
		if (!skill)
			throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)

		// Do not update this skill when no newer data is present.
		if (!shouldUpdateSkill(skillId))
			return

		// Implement the raw data into the data set.
		const rawSkillData = newRawSkillDataSet[skillId]
		newSkillDataSet[skillId] = new SkillData(skill, rawSkillData, newSkillDataSet)
	})
	return newSkillDataSet
}
module.exports.updateSkillDataSet = updateSkillDataSet
