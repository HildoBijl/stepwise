const { filterProperties, lastOf, secondLastOf } = require('../../../util')

const { toFO } = require('../../../inputTypes')

// getSimpleExerciseProcessor takes a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(checkInput, data) {
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple submissions) or as have a single user (a single action).
		if (submissionData.submissions)
			return processGroupActions({ checkInput, data, ...submissionData })
		return processUserAction({ checkInput, data, ...submissionData })
	}
}
module.exports.getSimpleExerciseProcessor = getSimpleExerciseProcessor

// processUserAction is the processor for a single user and not a group.
function processUserAction(submissionData) {
	return processGroupActions({
		...submissionData,
		submissions: [{ action: submissionData.action }],
	})
}
module.exports.processUserAction = processUserAction

// processGroupAction is the processor for a group of users.
function processGroupActions({ checkInput, data, progress, submissions, state, history, updateSkills }) {
	// Check for all the input actions whether they are correct.
	const correct = submissions.map(submission => submission.action.type === 'input' && checkInput(state, toFO(submission.action.input, true)))

	// If any of the submissions is correct, or if all gave up, then the exercise is done. Give everyone a skill update. (One exception: if a user gave up and has made a previous submission, then no skill update is done.)
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			if (action.type === 'input' || !hasPreviousInput(history, userId)) {
				updateSkills(data.skill, correct[index], userId)
				updateSkills(data.setup, correct[index], userId)
			}
		})
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true }
	}

	// No one had it right, but at least there were submissions. Give skill updates to wrong submissions (not to those who gave up) and leave the exercise open.
	submissions.forEach((submission, index) => {
		const { action, userId } = submission
		if (action.type === 'input') {
			updateSkills(data.skill, correct[index], userId)
			updateSkills(data.setup, correct[index], userId)
		}
	})
	return {}
}
module.exports.processGroupActions = processGroupActions

// getLastAction takes a history and returns the last action for the given user.
function getLastAction(history, userId) {
	// On no history, return nothing.
	if (history.length === 0)
		return undefined

	// Check if the history has an action at each event, and is hence a single-user exercise.
	if (lastOf(history).action)
		return lastOf(history).action

	// The exercise is a group exercise.
	const lastResolvedEvent = secondLastOf(history)
	const submissions = lastResolvedEvent?.submissions || []
	return submissions.find(submission => submission.userId === userId)?.action
}
module.exports.getLastAction = getLastAction

// getLastInput takes a history object and returns the last input for the given user. This can be an unresolved input, unless requireResolved is set to true, in which case a potential unresolved input is ignored.
function getLastInput(history, userId, requireResolved = false) {
	for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of the history. This depends on whether it's an individual or a group exercise.
		let userAction
		if (history[index].submissions && userId)
			userAction = (!requireResolved || history[index].progress) && history[index].submissions.find(submission => submission.userId === userId)?.action
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