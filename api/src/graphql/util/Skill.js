const { arraysToObject, keysToObject } = require('step-wise/util')
const { processSkillDataSet } = require('step-wise/skillTracking')
const { skillTree, ensureSkillId, includePrerequisitesAndLinks, processSkill, getDefaultSkillData } = require('step-wise/eduTools')

const events = {
	skillsUpdated: 'SKILLS_UPDATED',
}
module.exports.events = events

// getUserSkill takes a userId and a skillId and gets the corresponding skill object.
async function getUserSkill(db, userId, skillId) {
	return await db.UserSkill.findOne({
		where: { userId, skillId },
	})
}
module.exports.getUserSkill = getUserSkill

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user from the database. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted.
async function getUserSkills(db, userId, skillIds) {
	const where = { userId }
	if (skillIds)
		where.skillId = skillIds
	return await db.UserSkill.findAll({ where })
}
module.exports.getUserSkills = getUserSkills

// ToDo: sort out the functions below.

// getUserSkillDataSet takes a userId and skillIds and returns a skill data set object with SkillData parameters in it (so very processed objects) for the given user. To do so, it pulls the respective skills and their prerequisites from the database and processes the results. No caching is done.
async function getUserSkillDataSet(db, userId, skillIds) {
	// Load all required skills from the database. Process them into something functional.
	const allSkillIds = includePrerequisitesAndLinks(skillIds) // Add links.
	const rawSkills = await getUserSkills(db, userId, allSkillIds) // Pull all data from the database.
	const processedSkills = rawSkills.map(skill => processSkill(skill)) // Apply basic processing.
	const skillsAsObject = arraysToObject(processedSkills.map(skill => skill.skillId), processedSkills) // Turn the array into an object.
	const skills = keysToObject(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId)) // Add in missing skills that are not in the database yet.
	const skillDataSet = processSkillDataSet(skills, skillTree) // Turn the raw data into SkillData objects.
	return skillDataSet
}
module.exports.getUserSkillDataSet = getUserSkillDataSet

// getUserSkillExercises takes a userId and a skillId and returns a list of the exercises (IDs with states and progresses) that the user has done for that skill.
async function getUserSkillExercises(db, userId, skillId) {
	skillId = ensureSkillId(skillId)

	// Pull everything from the database.
	const user = userId && await db.User.findByPk(userId, {
		rejectOnEmpty: true,
		include: {
			association: 'skills',
			where: { skillId },
			required: false,
			include: {
				association: 'exercises',
				order: ['createdAt', 'ASC'],
				required: false,
			},
		},
	})
	if (!user)
		throw new AuthenticationError('No user is logged in.')

	// On a missing skill, there are no exercises.
	if (!user.skills || user.skills.length === 0)
		return []
	return user.skills[0].exercises || []
}
module.exports.getUserSkillExercises = getUserSkillExercises
