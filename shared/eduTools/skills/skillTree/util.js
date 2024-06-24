// getExerciseId takes an exerciseName like 'basicExample' and a skillId like 'someSkillId' and turns this into an exerciseId 'someSkillId.basicExample'. For safety, it first checks if it isn't already an ID.
function getExerciseId(exerciseName, skillId) {
	return exerciseName.includes('.') ? exerciseName : `${skillId}.${exerciseName}`
}
module.exports.getExerciseId = getExerciseId

// splitExerciseId turns an exerciseId like 'someSkillId.basicExample' into an object { skillId: 'someSkillId', exerciseName: 'basicExample' }.
function splitExerciseId(exerciseId) {
	const [skillId, exerciseName] = exerciseId.split('.')
	return { skillId, exerciseName }
}
module.exports.splitExerciseId = splitExerciseId

// getExerciseName turns an exerciseId like 'someSkillId.basicExample' and gets only the exerciseName, here 'basicExample'.
function getExerciseName(jointExerciseId) {
	return splitExerciseId(jointExerciseId).exerciseName
}
module.exports.getExerciseName = getExerciseName

// fixExerciseId is for the exerciseId legacy. It checks if the exerciseId has a skillId and if not (old format, only exerciseName) it adds this skillId to ensure a format 'skillId.exerciseName'. Later on, as older exercises have all been removed, the fixExerciseId function and all its implementations can be removed.
function fixExerciseId(exerciseId, skillId) {
	return exerciseId.includes('.') ? exerciseId : getExerciseId(exerciseId, skillId)
}
module.exports.fixExerciseId = fixExerciseId

// fixExerciseIdForExercise is for the exerciseId legacy. It takes an exercise object and checks if the exerciseId has a skillId and if not (old format) it fixes it.
function fixExerciseIdForExercise(exercise, skillId) {
	if (!exercise)
		return exercise // On no given exercise, don't fix it.
	if (exercise.exerciseId.includes('.'))
		return exercise // On a valid exercise, keep it as is.
	return { ...exercise, exerciseId: getExerciseId(exercise.exerciseId, skillId) } // Fix the exerciseId.
}
module.exports.fixExerciseIdForExercise = fixExerciseIdForExercise
