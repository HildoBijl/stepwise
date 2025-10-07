const DataLoader = require('dataloader')

const { exercises: allExercises } = require('step-wise/eduTools')

module.exports = ({ db }) => ({
	// exercisesForSkill is the DataLoader that loads all exercises for a given skill of a user.
	exercisesForSkill: new DataLoader(async userSkillIds => {
		// Load in the required exercise samples for all users.
		const exercises = await db.ExerciseSample.findAll({
			where: { userSkillId: userSkillIds },
			include: [{ association: 'events', order: [['createdAt', 'ASC']], separate: true }],
		})

		// Assign each set of exercises to the respective UserSkill. Then sort them separately for each UserSkill.
		exercisesPerUserSkill = {}
		userSkillIds.forEach(userSkillId => { exercisesPerUserSkill[userSkillId] = [] })
		exercises.forEach(exercise => {
			if (!allExercises[exercise.exerciseId])
				return // Only show existing exercises: filter out outdated/removed exercises.
			exercisesPerUserSkill[exercise.userSkillId].push(exercise)
		})
		userSkillIds.forEach(userSkillId => { exercisesPerUserSkill[userSkillId].sort((a, b) => a.createdAt - b.createdAt) })

		// Return the exercises in the same order as input skillIds
		return userSkillIds.map(userSkillId => exercisesPerUserSkill[userSkillId])
	}),
})
