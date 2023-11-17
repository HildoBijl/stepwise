const { lastOf, secondLastOf } = require('../../../../util')

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
	return {} // None found. 
}
module.exports.getPreviousProgress = getPreviousProgress
