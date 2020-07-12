const { IOtoFO } = require('../../inputTransformation')

// getStepExerciseProcessor takes a checkInput function that checks the input for a StepExercise and returns a processAction function.
function getStepExerciseProcessor(checkInput, data) {
	const { numSteps } = data
	return ({ progress, action, state, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.

		const step = getStep(progress)
		switch (action.type) {
			case 'input':
				const correct = checkInput(state, IOtoFO(action.input), step)
				if (correct) {
					// Solved the main problem?
					if (!progress.split) {
						if (updateSkills)
							updateSkills() // ToDo: update the right skills in the right way.
						return { solved: true, done: true }
					}

					// Solved a step?
					if (updateSkills)
						updateSkills() // ToDo: update the right skills in the right way.
					return nextStep({ ...progress, [step]: { solved: true, done: true } }, numSteps)
				} else {
					// Failed.
					if (updateSkills)
						updateSkills() // ToDo: update the right skills in the right way.
					return progress
				}

			case 'giveUp':
				// Give up on the main problem? Then split.
				if (!progress.split) {
					if (updateSkills)
						updateSkills() // ToDo: update the right skills in the right way.
					return nextStep({ split: true, step: 0 })
				}

				// Give up on a step?
				if (updateSkills)
					updateSkills() // ToDo: update the right skills in the right way.
				return nextStep({ ...progress, [step]: { givenUp: true, done: true } }, numSteps)

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}

function getStep(progress) {
	return progress.split ? progress.step : 0
}

function nextStep(progress, numSteps) {
	let step = getStep(progress)
	if (step === numSteps) {
		progress.done = true
	} else {
		step++
		progress.step = step
		progress[step] = {}
	}
	return progress
}

module.exports = {
	getStepExerciseProcessor,
	getStep,
}