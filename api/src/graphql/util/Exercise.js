const skills = require('step-wise/edu/skills')

// getActiveExerciseData takes a userId and a skillId. For this, it returns { user, skill, userSkill, activeExercise }. If requireExercise is set to true it ensures that there is an active exercise. On false it ensures that there is not. (Otherwise an error is thrown.)
async function getActiveExerciseData(userId, skillId, db, requireExercise = true) {
	// Check if the given skill exists.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Unknown skill "${skillId}".`)

	// Check if the user is logged in.
	if (!userId)
		throw new Error(`No user is logged in.`)

	// Pull everything from the database.
	const user = await db.User.findOne({
		where: { id: userId },
		include: {
			model: db.UserSkill,
			where: { skillId },
			include: {
				model: db.ExerciseSample,
				where: { active: true },
				required: false,
			}
		}
	})
	if (!user)
		throw new Error(`No user is logged in.`)

	// Check the UserSkill.
	let userSkill = user.userSkills[0]
	if (!userSkill) {
		if (requireExercise) {
			throw new Error(`No exercise is open.`)
		} else {
			userSkill = await user.createUserSkill({ skillId })
		}
	}

	// Check the exercise.
	let activeExercise = userSkill.exerciseSamples && userSkill.exerciseSamples[0]
	if (requireExercise) {
		if (!activeExercise)
			throw new Error(`There is no active exercise for skill "${skillId}".`)
	} else {
		if (activeExercise)
			throw new Error(`There is still an active exercise for skill "${skillId}".`)
	}

	return { user, skill, userSkill, activeExercise }
}

module.exports = {
	getActiveExerciseData,
}
