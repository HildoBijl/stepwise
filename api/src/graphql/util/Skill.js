const { UserInputError } = require('apollo-server-express')

const skills = require('step-wise/edu/skills')
const SkillData = require('step-wise/edu/skills/SkillData')
const { includePrerequisites, processSkill, getDefaultSkillData } = require('step-wise/edu/skills/util')

// checkSkillIds checks an array of skillIds to see if they exist. It throws an error on an unknown skill. Otherwise it does nothing.
function checkSkillIds(skillIds) {
	skillIds.forEach(skillId => {
		if (!skills[skillId])
			throw new UserInputError(`Unknown skill "${skillId}" encountered.`)
	})
}
module.exports.checkSkillIds = checkSkillIds

// getUserSkill takes a userId and a skillId and gets the corresponding skill object, including all exercises and actions.
async function getUserSkill(userId, skillId, db) {
	checkSkillIds([skillId])

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
	checkSkillIds(skillIds || [])

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

// getUserSkillsData takes a userId and skillIds and returns SkillData objects (so very processed objects) for the given user. To do so, it pulls the respective skills and their prerequisites from the database and processes the results. No caching is done.
async function getUserSkillsData(userId, skillIds, db) {
	// Load all required skills from the database.
	const skillIdsWithPrerequisites = includePrerequisites(skillIds)
	const skills = await getUserSkills(userId, skillIdsWithPrerequisites, db)

	// Process the skills into a raw data set.
	const data = {}
	skills.forEach(skill => {
		data[skill.skillId] = processSkill(skill)
	})

	// Add skills that are not in the data set. (These are skills that are not in the database yet.)
	skillIdsWithPrerequisites.forEach(skillId => {
		if (!data[skillId])
			data[skillId] = getDefaultSkillData(skillId)
	})

	// Set up SkillData objects and return them.
	const result = {}
	skillIds.forEach(skillId => {
		result[skillId] = new SkillData(skillId, data)
	})
	return result
}
module.exports.getUserSkillsData = getUserSkillsData
