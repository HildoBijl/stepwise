const { IOtoFO } = require('../inputTypes')

// getStepExerciseProcessor takes a checkInput function that checks the input for a StepExercise and returns a processAction function.
function getStepExerciseProcessor(checkInput, data) {
	const numSteps = data.steps.length
	return ({ progress, action, state, history, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.

		const step = getStep(progress)
		switch (action.type) {
			case 'input':
				const correct = checkInput(state, IOtoFO(action.input), step)
				if (correct) {
					// Solved the main problem?
					if (!progress.split) {
						if (updateSkills) {
							updateSkills(data.skill, true)
							updateSkills(data.setup, true)
						}
						return { solved: true, done: true }
					}

					// Solved a step?
					if (updateSkills)
						updateSkills(data.steps[step - 1], true)
					return nextStep({ ...progress, [step]: { solved: true, done: true } }, numSteps)
				} else {
					// Failed.
					if (updateSkills) {
						if (!progress.split) {
							// Failed the main problem.
							updateSkills(data.skill, false)
							updateSkills(data.setup, false)
						} else {
							// Failed a step.
							updateSkills(data.steps[step - 1], false)
						}
					}
					return progress
				}

			case 'giveUp':
				// Give up on the main problem? Then split.
				if (!progress.split) {
					if (updateSkills && history.length === 0) { // If no input has been submitted for this step, then downgrade it.
						updateSkills(data.skill, true)
						updateSkills(data.setup, false)
					}
					return nextStep({ split: true, step: 0 })
				}

				// Give up on a step?
				if (updateSkills) {
					// If no input has been submitted for this step, then downgrade it.
					const eventAtStepWithInput = history.find((event, index) => {
						const action = event.action
						const prevProgress = (index === 0 ? {} : history[index - 1].progress)
						const prevStep = getStep(prevProgress)
						return step === prevStep && action.type === 'input'
					})
					if (!eventAtStepWithInput)
						updateSkills(data.steps[step - 1], false)
				}
				return nextStep({ ...progress, [step]: { givenUp: true, done: true } }, numSteps)

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}
module.exports.getStepExerciseProcessor = getStepExerciseProcessor

// getStep takes a progress object and returns the step which this problem is at.
function getStep(progress) {
	return progress.split ? progress.step : 0
}
module.exports.getStep = getStep

// nextStep takes a progress object and adjusts it to make it one in which the current step is done. The object is adjusted and returned.
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
