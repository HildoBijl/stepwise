const { toFO } = require('../../../inputTypes')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput, data) {
	return ({ progress, action, state, history, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.

		switch (action.type) {
			case 'input':
				const correct = checkInput(state, toFO(action.input))
				if (correct) {
					updateSkills(data.skill, true) // Correctly solved.
					updateSkills(data.setup, true)
					return { solved: true, done: true }
				} else {
					updateSkills(data.skill, false) // Incorrectly solved.
					updateSkills(data.setup, false)
					return {}
				}

			case 'giveUp':
				// When there have been no attempts yet, downgrade too.
				if (history.length === 0) {
					updateSkills(data.skill, false)
					updateSkills(data.setup, false)
				}
				return { givenUp: true, done: true }

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}
module.exports.getSimpleExerciseProcessor = getSimpleExerciseProcessor

// getLastInput takes a history object and returns the last given input.
function getLastInput(history) {
	for (let i = history.length - 1; i >= 0; i--) {
		if (history[i].action.type === 'input')
			return history[i].action.input
	}
	return null
}
module.exports.getLastInput = getLastInput