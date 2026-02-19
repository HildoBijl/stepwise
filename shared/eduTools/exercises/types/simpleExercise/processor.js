const { isPlainObject } = require('../../../../util')
const { toFO } = require('../../../../inputTypes')

const { hasPreviousInput } = require('../stepExercise')

// getSimpleExerciseProcessor takes exerciseData with a checkInput function that checks the input for a SimpleExercise and returns a processAction function.
function getSimpleExerciseProcessor(exerciseData) {
	// Check the input.
	if (!isPlainObject(exerciseData))
		throw new Error(`Invalid SimpleExercise exerciseData: expected an object as parameter, but received something of type ${typeof exerciseData}.`)
	const { checkInput, metaData } = exerciseData
	if (!checkInput || typeof checkInput !== 'function')
		throw new Error(`Invalid SimpleExercise checkInput: expected a checkInput function as parameter, but received something of type ${typeof checkInput}.`) 
	if (!metaData || !isPlainObject(metaData))
		throw new Error(`Invalid SimpleExercise metaData: expected a metaData object as parameter, but received something of type ${typeof metaData}.`) 

	// Set up the processor.
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple submissions) or as have a single user (a single action).
		if (submissionData.submissions)
			return processGroupActions({ ...exerciseData, ...submissionData })
		return processUserAction({ ...exerciseData, ...submissionData })
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

// processGroupActions is the processor for a group of users.
function processGroupActions({ checkInput, metaData, getSolution, submissions, state, history, updateSkills }) {
	// Get the solution of the exercise, if it exists.
	const solution = (typeof getSolution === 'function') ? getSolution(state) : undefined

	// Check for all the input actions whether they are correct.
	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input')
			return false
		const input = toFO(submission.action.input, true)
		let currSolution = solution
		if (!currSolution && getSolution)
			currSolution = assembleSolution(getSolution, state, input)
		return checkInput({ state, input, solution: currSolution, metaData })
	})

	// If any of the submissions is correct, or if all gave up, then the exercise is done. Give everyone a skill update. (One exception: if a user gave up and has made a previous submission, then no skill update is done.)
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	if (someCorrect || allGaveUp) {
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			if (action.type === 'input' || !hasPreviousInput(history, userId)) {
				updateSkills(metaData.skill, correct[index], userId)
				updateSkills(metaData.setup, correct[index], userId)
			}
		})
		return { [someCorrect ? 'solved' : 'givenUp']: true, done: true }
	}

	// No one had it right, but at least there were submissions. Give skill updates to wrong submissions (not to those who gave up) and leave the exercise open.
	submissions.forEach((submission, index) => {
		const { action, userId } = submission
		if (action.type === 'input') {
			updateSkills(metaData.skill, correct[index], userId)
			updateSkills(metaData.setup, correct[index], userId)
		}
	})
	return {}
}
