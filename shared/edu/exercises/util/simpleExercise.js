const { filterProperties } = require('../../../util/objects')
const { toFO } = require('../../../inputTypes')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput, data) {
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple actions) or as have a single user (a single action).
		if (submissionData.actions)
			return processGroupActions({ checkInput, data, ...submissionData })
		return processUserAction({ checkInput, data, ...submissionData })
	}
}
module.exports.getSimpleExerciseProcessor = getSimpleExerciseProcessor

// processUserAction is the processor for a single user and not a group.
function processUserAction(submissionData) {
	return processGroupActions({
		...submissionData,
		actions: [submissionData.action],
	})
}
module.exports.processUserAction = processUserAction

// processGroupAction is the processor for a group of users.
function processGroupActions({ checkInput, data, progress, actions, state, history, updateSkills }) {
	// Check for all the input actions whether they are correct.
	const correct = actions.map(action => action.type === 'input' && checkInput(state, toFO(action.input, true)))

	// If any of the submissions is correct, or if all gave up, then the exercise is done. Give everyone a skill update. (One exception: if a user gave up and has made a previous submission, then no skill update is done.)
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = actions.every(action => action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		actions.forEach((action, index) => {
			if (action.type === 'input' || !hasPreviousInput(history, action.userId)) {
				updateSkills(data.skill, correct[index], action.userId)
				updateSkills(data.setup, correct[index], action.userId)
			}
		})
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true }
	}

	// No one had it right, but at least there were submissions. Give skill updates to wrong submissions (not to those who gave up) and leave the exercise open.
	actions.forEach((action, index) => {
		if (action.type === 'input') {
			updateSkills(data.skill, correct[index], action.userId)
			updateSkills(data.setup, correct[index], action.userId)
		}
	})
	return {}
}
module.exports.processGroupActions = processGroupActions

// getLastInput takes a history object and returns the last given input.
function getLastInput(history, userId, requireSubmitted = false) {
	for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of the history. This depends on whether it's an individual or a group exercise.
		let userAction
		if (history[index].actions && userId)
			userAction = (!requireSubmitted || history[index].progress) && history[index].actions.find(action => action.userId === userId)?.action
		else if (history[index].action)
			userAction = history[index].action
		else
			throw new Error(`Invalid getLastInput case. Cannot determine if it is for a user or for a group.`)

		// If it is an input action, return it.
		if (userAction && userAction.type === 'input')
			return userAction.input
	}

	// Nothing found: return undefined.
	return undefined
}
module.exports.getLastInput = getLastInput

// hasPreviousInput takes a history object and checks if a user has made a previous input.
function hasPreviousInput(history, userId) {
	return !!getLastInput(history, userId)
}
module.exports.hasPreviousInput = hasPreviousInput

// getLastProgress returns the last progress object from the history array.
function getLastProgress(history) {
	for (let index = history.length - 1; index >= 0; index--) {
		if (history[index].progress !== null)
			return history[index].progress
	}
	return {} // None foune. 
}
module.exports.getLastProgress = getLastProgress

// getPreviousProgress returns the second-to-last progress object from the history array.
function getPreviousProgress(history) {
	for (let index = history.length - 1; index > 0; index--) {
		if (history[index].progress !== null)
			return history[index - 1].progress
	}
	return {} // None foune. 
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