const { SkillData } = require('./SkillData')

function processSkillDataSet(rawSkillDataSet, skillTree) {
	return updateSkillDataSet({}, rawSkillDataSet, skillTree) // Pass on to the update function, starting with an empty data set.
}
module.exports.processSkillDataSet = processSkillDataSet

function updateSkillDataSet(skillDataSet, newRawSkillDataSet, skillTree) {
	Object.keys(newRawSkillDataSet).forEach(skillId => {
		// Check that the given skill exists.
		const skill = skillTree[skillId]
		if (!skill)
			throw new Error(`Invalid skill given: a skill ID "${skillId}" was supplied inside of a raw data set, but this skill is not known in the full skill tree.`)

		// Implement the raw data into the data set. This may or may not override an existing skill, but either way it will work out.
		const rawSkillData = newRawSkillDataSet[skillId]
		skillDataSet[skillId] = new SkillData(skill, rawSkillData, skillDataSet)
	})
}
module.exports.updateSkillDataSet = updateSkillDataSet
