// getCurrentExerciseOfSkill returns { userSkill, exercise } for the given userId and skillId, where exercise is the currently active exercise. It is null if no active exercise exists for the given skill. userSkill is null if no entry exists for this skill in the database (in which case there certainly is no active exercise).
async function getCurrentExerciseOfSkill(userId, skillId, db) {
	// [ToDo: check if this can be done in one query, using a composite primary key or a join.]
	// Extract the user skill from the database.
	const userSkill = await db.UserSkill.findOne({ where: { userId, skillId } })
	if (!userSkill || !userSkill.currentExerciseId)
		return { userSkill, exercise: null }

	// Find the last exercise and see if it's active. (It should be, but just in case.)
	const exercise = await db.ExerciseSample.findOne({ where: { userSkillId: userSkill.id, active: true } })
	return { userSkill, exercise }
}

module.exports = {
	getCurrentExerciseOfSkill,
}
