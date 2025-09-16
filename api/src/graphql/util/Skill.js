const { UserInputError } = require('apollo-server-express')

const { exercises: allExercises } = require('step-wise/eduTools')

const events = {
	skillsUpdated: 'SKILLS_UPDATED',
}
module.exports.events = events

// getUserSkill takes a userId and a skillId and gets the corresponding skill object. It returns this as an object. There are other getter-options that may be given, like includeActiveExercise or includeExercises. If given, an object like { skill, activeExercise, exercises } will be returned. Checking options like requireActiveExercise or requireNoActiveExercise may also be given.
async function getUserSkill(db, userId, skillId, { includeActiveExercise = false, includeExercises = false, requireActiveExercise = false, requireNoActiveExercise = false, createIfNoneExists = false } = {}) {
	// Pull the skill with its active exercise from the database.
	const loadExercises = includeActiveExercise || includeExercises || requireActiveExercise || requireNoActiveExercise
	let skill = await db.UserSkill.findOne({
		where: { userId, skillId },
		include: loadExercises ? {
			association: 'exercises',
			where: includeExercises ? undefined : { active: true },
			required: false,
			order: [['createdAt', 'ASC']],
			separate: true,
			include: {
				association: 'events',
				required: false,
				order: [['createdAt', 'ASC']],
				separate: true,
			},
		} : undefined,
	})

	// If there is no skill, either create it (if specified) or just return null.
	if (!skill) {
		if (requireActiveExercise)
			throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
		if (!createIfNoneExists)
			return null
		skill = await db.UserSkill.create({ userId, skillId })
	}

	// Obtain the active exercise. If there is an active exercise, but the corresponding exercise script is missing (deleted), then deactivate the exercise and don't return it.
	const exercises = skill.exercises || []
	let activeExercise = exercises.find(exercise => exercise.active)
	if (activeExercise && !allExercises[activeExercise.exerciseId]) {
		await activeExercise.update({ active: false })
		activeExercise = undefined
	}

	// Check the necessary requirements.
	if (requireActiveExercise && !activeExercise)
		throw new UserInputError(`There is no active exercise for skill "${skillId}".`)
	if (requireNoActiveExercise && activeExercise)
		throw new UserInputError(`There is still an active exercise for skill "${skillId}".`)

	// Return the result. The format depends on the options.
	if (includeActiveExercise || includeExercises)
		return { skill, exercises, activeExercise }
	return skill
}
module.exports.getUserSkill = getUserSkill

// getUserSkills takes a userId and skillIds and gets the UserSkills for the given user from the database. The parameter skillIds can be ommitted (falsy) in which case all skills are extracted. No exercise data is included.
async function getUserSkills(db, userId, skillIds) {
	const where = { userId }
	if (skillIds)
		where.skillId = skillIds
	return await db.UserSkill.findAll({ where })
}
module.exports.getUserSkills = getUserSkills
