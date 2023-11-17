const { ensureSetup } = require('../../../skillTracking')

// getDifficulty takes the data object of an exercise and returns the difficulty, in the form of a setup object.
function getDifficulty(data) {
	return ensureSetup(data.setup || data.skill)
}
module.exports.getDifficulty = getDifficulty

// getAllExercises walks through all the skills and returns an array (without duplicates) of all the exercise ids. It's useful for testing purposes.
function getAllExercises() {
	const exercises = new Set() // Use a set to remove duplicates.
	Object.values(skillTree).forEach(skill => {
		skill.exercises.forEach(exercise => exercises.add(exercise))
	})
	return [...exercises] // Return as array.
}
module.exports.getAllExercises = getAllExercises
