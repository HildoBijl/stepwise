const skills = require('../../skills')

// selectExercise takes a skill and randomly picks an exercise from the collection.
function selectExercise(skillId) {
	// ToDo: implement exercise weights.
	// ToDo: implement user coefficients.
	// ToDo: implement knowledge of prior exercises.

	// Extract the skill data.
	const skill = skills[skillId]
	if (!skill)
		throw new Error(`Could not select an exercise: the skillId "${skillId}" is unknown.`)

	// Select a random exercise from the list.
	const exercises = skill.exercises
	return exercises[Math.floor(Math.random() * exercises.length)]
}

// getNewExercise takes a skillId and returns a set of exercise data of the form { id: 'linearEquations', state: { a: 3, b: 12 } }. The state is given in functional format.
function getNewExercise(skillId) {
	const exerciseId = selectExercise(skillId)
	const { generateState } = require(`../../exercises/${exerciseId}`)
	return {
		exerciseId,
		state: generateState(),
	}
}

// getAllExercises walks through all the skills and returns an array (without duplicates) of all the exercise ids. It's useful for testing purposes.
function getAllExercises() {
	const exercises = new Set() // Use a set to remove duplicates.
	Object.values(skills).forEach(skill => {
		skill.exercises.forEach(exercise => exercises.add(exercise))
	})
	return [...exercises] // Return as array.
}

module.exports = {
	selectExercise,
	getNewExercise,
	getAllExercises,
}