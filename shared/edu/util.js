const skills = require('./skills')

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
	return exercises[Math.floor(Math.random()*exercises.length)]
}

// getNewExercise takes a skillId and returns a set of exercise data of the form { id: 'linearEquations', state: { a: 3, b: 12 } }.
function getNewExercise(skillId) {
	const exerciseId = selectExercise(skillId)
	// const { generateState } = require(`./exercises/${exerciseId}`)
	const { generateState } = require(`./exercises/${exerciseId}`)
	return {
		id: exerciseId,
		state: generateState(),
	}
}

// checkExerciseInput checks the input for a given exercise with corresponding state.
function checkExerciseInput(exerciseId, state, input) {
	const { checkInput } = require(`./exercises/${exerciseId}`)
	return checkInput(state, input)
}

module.exports = {
	selectExercise,
	getNewExercise,
	checkExerciseInput,
}
