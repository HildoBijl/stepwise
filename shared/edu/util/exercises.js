const skills = require('../skills')
const { IOtoFO } = require('../inputTransformation')

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
	const { generateState } = require(`../exercises/${exerciseId}`)
	return {
		exerciseId,
		state: generateState(),
	}
}

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput) {
	return ({ progress, action, state, updateSkills }) => {
		switch (action.type) {
			case 'input':
				const correct = checkInput(IOtoFO(state), IOtoFO(action.input))
				if (correct) {
					if (updateSkills)
						updateSkills() // ToDo: update the right skills in the right way.
					return { solved: true, done: true }
				} else {
					if (updateSkills)
						updateSkills() // ToDo: update the right skills in the right way.
					return {}
				}

			case 'giveUp':
				if (updateSkills)
					updateSkills() // ToDo: update the right skills in the right way.
				return { givenUp: true, done: true }

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}

module.exports = {
	selectExercise,
	getNewExercise,
	getSimpleExerciseProcessor,
}