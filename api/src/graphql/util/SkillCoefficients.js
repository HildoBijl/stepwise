const { ensureBoolean, fromEntries, fromKeys, union } = require('@step-wise/utils')
const { getBernsteinExpectedValue } = require('@step-wise/bernstein-polynomials')
const { ensureSetup } = require('@step-wise/skill-setup')
const { skillTree, ensureSkillIds, includeDirectPrerequisitesAndLinks } = require('@step-wise/skill-tree')
const { SkillLevelSet, getInitialSkillLevel, ensureSkillLevel } = require('@step-wise/skill-tracking')
const { processSkill, getDefaultSkillLevel } = require('step-wise/eduTools')

const { getUserSkills } = require('./Skill')

// getUserSkillLevelSet takes a userId and skillIds and returns a skill data set object with SkillLevel parameters in it (so very processed objects) for the given user. To do so, it pulls the respective skills and their prerequisites from the database and processes the results. No caching is done.
async function getUserSkillLevelSet(db, userId, skillIds) {
	// Load all required skills from the database. Process them into something functional.
	const allSkillIds = includeDirectPrerequisitesAndLinks(skillIds) // Add links.
	const rawSkills = await getUserSkills(db, userId, allSkillIds) // Pull all data from the database.
	const processedSkills = rawSkills.map(skill => processSkill(skill)) // Apply basic processing.
	const skillsAsObject = fromEntries(processedSkills.map(skill => skill.skillId), processedSkills) // Turn the array into an object.
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillLevel(skillId)) // Add in missing skills that are not in the database yet.
	const skillLevelSet = new SkillLevelSet(skillTree, skills) // Turn the raw data into SkillLevel objects.
	return skillLevelSet
}
module.exports.getUserSkillLevelSet = getUserSkillLevelSet

// applySkillUpdates takes an array [{ setup: {...}, correct: true/false, userId: 'someId' }, ...] and applies all the skill updates into the database. It returns an object { [userId1]: [updatedSkill1, updatedSkill2, ...], [userId2]: [...] }.
async function applySkillUpdates(db, skillUpdates, transaction) {
	// Group the skill updates per user.
	const skillUpdatesPerUser = {}
	skillUpdates.forEach(skillUpdate => {
		const { userId } = skillUpdate
		if (!skillUpdatesPerUser[userId])
			skillUpdatesPerUser[userId] = []
		skillUpdatesPerUser[userId].push(skillUpdate)
	})

	// Process the skill updates for each user separately.
	const userIds = Object.keys(skillUpdatesPerUser)
	const result = await Promise.all(userIds.map(userId => applySkillUpdatesForUser(db, userId, skillUpdatesPerUser[userId], transaction)))
	return fromEntries(userIds, result)
}
module.exports.applySkillUpdates = applySkillUpdates

// applySkillUpdatesForUser takes an array [{ setup: {...}, correct: true/false }, ...] and applies all these skill updates for the given userId.
async function applySkillUpdatesForUser(db, userId, skillUpdates, transaction) {
	// Ensure valid skill updates.
	skillUpdates = skillUpdates.map(({ setup, correct }) => ({
		setup: ensureSetup(setup),
		correct: ensureBoolean(correct),
	}))

	// Extract all skillIds in the updates, ensuring there are no duplicates and making sure they all exist.
	const skillSets = skillUpdates.map(({ setup }) => setup.getSkillSet())
	const skillSetsMerged = union(...skillSets)
	const skillIds = ensureSkillIds([...skillSetsMerged])

	// If there are no skills, don't do anything. Return an empty array to show no skills were adjusted.
	if (skillIds.length === 0)
		return []

	// Pull everything from the database.
	const skills = await getUserSkills(db, userId, includeDirectPrerequisitesAndLinks(skillIds))
	const skillsAsObject = fromEntries(skills.map(skill => skill.skillId), skills)
	const rawSkillLevelSet = fromKeys(skillIds, skillId => skillsAsObject[skillId] ? ensureSkillLevel(skillsAsObject[skillId]) : getInitialSkillLevel())

	// Plug it into the SkillLevelSet object and let it run its magic.
	const skillLevelSet = new SkillLevelSet(skillTree, rawSkillLevelSet)
	const updates = skillLevelSet.processObservations(skillUpdates)

	// Walk through the updates to set up sequelize-update promises.
	const skillUpdatePromises = Object.keys(updates).map(skillId => {
		const update = updates[skillId]
		const skill = skillsAsObject[skillId]
		if (skill) return skill.update(update, { transaction })
		return db.UserSkill.create({
			userId,
			skillId,
			...update,
		}, { transaction })
	})

	// Wait until all promises are resolved and return the adjusted skills in an array.
	return await Promise.all(skillUpdatePromises)
}
module.exports.applySkillUpdatesForUser = applySkillUpdatesForUser
