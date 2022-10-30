const { filterProperties } = require('../../../util/objects')
const { toFO } = require('../../../inputTypes')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput, data) {
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple actions) or as have a single user (a single action).
		if (submissionData.actions)
			return processGroupAction({ checkInput, data, ...submissionData })
		return processUserAction({ checkInput, data, ...submissionData })
	}
}
module.exports.getSimpleExerciseProcessor = getSimpleExerciseProcessor

// processUserAction is the processor for a single user and not a group.
function processUserAction({ checkInput, data, progress, action, state, history, updateSkills }) {
	switch (action.type) {
		case 'input':
			const correct = checkInput(state, toFO(action.input, true))
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

// processGroupAction is the processor for a group of users.
function processGroupAction({ checkInput, data, progress, actions, state, history, updateSkills }) {
	// Check for all the input actions whether they are correct.
	const correct = actions.map(action => action.type === 'input' && checkInput(state, toFO(action.input, true)))

	// If any of the submissions is correct, or if all gave up, then the exercise is done. Give everyone a skill update.
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(action => action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		actions.forEach((action, index) => {
			updateSkills(data.skill, correct[index], action.userId)
			updateSkills(data.setup, correct[index], action.userId)
		})
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true }
	}

	// No one had it right, but at least there were submissions. Give skill updates to wrong submissions and leave the exercise open.
	actions.forEach((action, index) => {
		if (action.type === 'input') {
			updateSkills(data.skill, correct[index], action.userId)
			updateSkills(data.setup, correct[index], action.userId)
		}
	})
	return {}
}

// getLastInput takes a history object and returns the last given input.
function getLastInput(history) {
	for (let i = history.length - 1; i >= 0; i--) {
		if (history[i].action.type === 'input')
			return history[i].action.input
	}
	return undefined
}
module.exports.getLastInput = getLastInput

// getLastProgress returns the last progress object from the history array.
function getLastProgress(history) {
	if (history.length === 0)
		return {}
	return history[history.length - 1].progress
}
module.exports.getLastProgress = getLastProgress

// getPreviousProgress returns the second-to-last progress object from the history array.
function getPreviousProgress(history) {
	if (history.length <= 1)
		return {}
	return history[history.length - 2].progress
}
module.exports.getPreviousProgress = getPreviousProgress

// assembleSolution takes an object with dependency data and assembles a solution object from it.
function assembleSolution(dependencyData, state, input) {
	const { getSolution, getStaticSolution, getInputDependency, dependentFields, getDynamicSolution } = dependencyData

	// Get the static solution.
	const currGetSolution = getSolution || getStaticSolution // They perform the same function.
	if (!currGetSolution)
		throw new Error(`Invalid assembleSolution call: could not find a getSolution or getStaticSolution function. Hence failed to assemble a solution object.`)
	const staticSolution = currGetSolution(state)

	// If there is no dynamic solution, we're done.
	if (!getDynamicSolution)
		return staticSolution

	// Get the input dependency and use it to find the dynamic solution.
	const filteredInput = dependentFields ? filterProperties(input, dependentFields) : input
	const inputDependency = getInputDependency ? getInputDependency(filteredInput, staticSolution) : filteredInput
	const dynamicSolution = getDynamicSolution(inputDependency, staticSolution, state)
	return { ...(staticSolution || {}), ...(dynamicSolution || {}) }
}
module.exports.assembleSolution = assembleSolution