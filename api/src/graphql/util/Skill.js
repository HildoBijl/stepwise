const { UserInputError } = require('apollo-server-express')

const { arraysToObject, keysToObject } = require('step-wise/util/objects')
const { processSkillDataSet } = require('step-wise/skillTracking')
const { skillTree } = require('step-wise/edu/skills')
const { ensureSkillId, ensureSkillIds, includePrerequisitesAndLinks, processSkill, getDefaultSkillData } = require('step-wise/edu/skills/util')

const events = {
	skillsUpdated: 'SKILLS_UPDATED',
}
module.exports.events = events

// getUserSkill takes a userId and a skillId and gets the corresponding skill object, including all exercises and actions.
async function getUserSkill(userId, skillId, db) {
	skillId = ensureSkillId(skillId)

	// Load all data.
	const user = userId && await db.User.findByPk(userId, {
		rejectOnEmpty: true,
		include: {
			association: 'skills',
			where: { skillId },
			required: false,
			include: {
				association: 'exercises',
				required: false,
				include: {
					association: 'events',
					required: false,
				},
			},
		},
	})

	if (!user)
		throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)

	return user.skills[0]
}
module.exports.getUserSkill = getUserSkill

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user from the database. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted. This is usually not recommended though. No exercises are loaded.
async function getUserSkills(userId, skillIds, db) {
	if (skillIds)
		skillIds = ensureSkillIds(skillIds)

	// Load all data.
	const user = userId && await db.User.findByPk(userId, {
		rejectOnEmpty: true,
		include: {
			association: 'skills',
			where: skillIds ? { skillId: skillIds } : true,
			required: false,
		},
	})

	if (!user)
		throw new UserInputError(`Invalid request: unknown user ID "${userId}".`)

	return user.skills
}
module.exports.getUserSkills = getUserSkills

// getUserSkillDataSet takes a userId and skillIds and returns a skill data set object with SkillData parameters in it (so very processed objects) for the given user. To do so, it pulls the respective skills and their prerequisites from the database and processes the results. No caching is done.
async function getUserSkillDataSet(userId, skillIds, db) {
	// Load all required skills from the database. Process them into something functional.
	const allSkillIds = includePrerequisitesAndLinks(skillIds) // Add links.
	const rawSkills = await getUserSkills(userId, allSkillIds, db) // Pull all data from the database.
	const processedSkills = rawSkills.map(skill => processSkill(skill)) // Apply basic processing.
	const skillsAsObject = arraysToObject(processedSkills.map(skill => skill.skillId), processedSkills) // Turn the array into an object.
	const skills = keysToObject(skillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId)) // Add in missing skills that are not in the database yet.
	const skillDataSet = processSkillDataSet(skills, skillTree) // Turn the raw data into SkillData objects.
	return skillDataSet
}
module.exports.getUserSkillDataSet = getUserSkillDataSet
