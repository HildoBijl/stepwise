const { toFO } = require('../../../inputTypes')

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
