const DataLoader = require('dataloader')

module.exports = ({ db }) => ({
	// exercisesForSkill is the DataLoader that loads all exercises for a given skill of a user.
	exercisesForSkill: new DataLoader(async userSkillIds => {
		// Load in the required skill levels for all users.
		const exercises = await db.ExerciseSample.findAll({
			where: { userSkillId: userSkillIds },
			include: [{ association: 'events', order: [['createdAt', 'ASC']] }],
		})

		// Assign each set of exercises to the respective UserSkill. Then sort them separately for each UserSkill.
		exercisesPerUserSkill = {}
		userSkillIds.forEach(userSkillId => { exercisesPerUserSkill[userSkillId] = [] })
		exercises.forEach(exercise => { exercisesBySkill[exercise.userSkillId].push(exercise) })
		userSkillIds.forEach(userSkillId => { exercisesPerUserSkill[userSkillId].sort((a, b) => a.createdAt - b.createdAt) })

		// Return the exercises in the same order as input skillIds
		return userSkillIds.map(userSkillId => exercisesPerUserSkill[userSkillId])
	}),
})
