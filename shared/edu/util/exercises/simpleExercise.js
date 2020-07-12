const { IOtoFO } = require('../../inputTransformation')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput) {
	return ({ progress, action, state, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.
			
		switch (action.type) {
			case 'input':
				const correct = checkInput(state, IOtoFO(action.input))
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
	getSimpleExerciseProcessor,
}