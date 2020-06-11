// isExerciseDone checks whether a given exercise with a "status" parameter is done (solved or given up) or not. Returns a boolean.
function isExerciseDone(exercise) {
	return (exercise.status === 'solved' || exercise.status === 'splitSolved' || exercise.status === 'givenUp')
}

// getCurrentExerciseOfSkill returns { userSkill, exercise } for the given userId and skillId, where exercise is the currently active exercise. It is null if no active exercise exists for the given skill. userSkill is null if no entry exists for this skill in the database (in which case there certainly is no active exercise).
async function getCurrentExerciseOfSkill(userId, skillId, dataSources) {
	// [ToDo: check if this can be done in one query, using a composite primary key or a join.]
	// Extract the user skill from the database.
	const userSkill = await dataSources.database.UserSkill.findOne({ where: { userId, skillId } })
	if (!userSkill || !userSkill.currentExerciseId)
		return { userSkill, exercise: null }

	// Find the last exercise and see if it's active. (It should be, but just in case.)
	const exercise = await userSkill.getCurrentExercise()
	return (!exercise || isExerciseDone(exercise)) ?
		{ userSkill, exercise: null } :
		{ userSkill, exercise }
}

module.exports = {
	isExerciseDone,
	getCurrentExerciseOfSkill,
}
