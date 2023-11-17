// getLastInput takes a history object and returns the last given input at the given step. If step is undefined, any step will do. (This also makes it suitable for the simpleExercise.) The given input can be an unresolved input (in case of group work) unless requireResolved is set to true, in which case a potentially unresolved input is ignored.
function getLastInput(history, userId, step, requireResolved = false) {
	for (let index = history.length - 1; index >= 0; index--) {
		// Determine the action of the user in this piece of the history. This depends on whether it's an individual or a group exercise. If it's not an input, ignore this history event.
		let userAction
		if (userId && history[index].submissions)
			userAction = (!requireResolved || history[index].progress) && history[index].submissions.find(submission => submission.userId === userId)?.action
		else if (history[index].action)
			userAction = history[index].action
		else
			throw new Error(`Invalid getLastInput case. Cannot determine if it is for a user or for a group.`)

		// If there is no valid action, keep on looking.
		if (!userAction || userAction.type !== 'input')
			continue

		// Determine the previous progress. If it's not at the right step, keep on looking.
		if (step !== undefined) {
			const previousProgress = index === 0 ? {} : history[index - 1].progress
			const previousStep = getStep(previousProgress)
			if (step !== previousStep)
				continue // Not at the right step.
		}

		// All conditions match. Returns the given action.
		return userAction.input
	}

	// Nothing found: return undefined.
	return undefined
}
module.exports.getLastInput = getLastInput

// hasPreviousInput takes a history object and checks if a user has made a previous input at the given step.
function hasPreviousInput(history, userId, step) {
	return !!getLastInput(history, userId, step)
}
module.exports.hasPreviousInput = hasPreviousInput

// getStep takes a progress object and returns the step which this problem is at.
function getStep(progress) {
	return progress.split ? progress.step : 0
}
module.exports.getStep = getStep
