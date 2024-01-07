const { isBasicObject } = require('../../../../util')
const { toFO } = require('../../../../inputTypes')

const { hasPreviousInput, getStep } = require('./util')
const { assembleSolution } = require('./solution')

// getStepExerciseProcessor takes exerciseData with a checkInput function that checks the input for a StepExercise and returns a processAction function.
function getStepExerciseProcessor(exerciseData) {
	// Check the input.
	if (!isBasicObject(exerciseData))
		throw new Error(`Invalid StepExercise exerciseData: expected an object as parameter, but received something of type ${typeof exerciseData}.`)
	const { checkInput, metaData } = exerciseData
	if (!checkInput || typeof checkInput !== 'function')
		throw new Error(`Invalid StepExercise checkInput: expected a checkInput function as parameter, but received something of type ${typeof checkInput}.`)
	if (!metaData || !isBasicObject(metaData))
		throw new Error(`Invalid StepExercise metaData: expected a metaData object as parameter, but received something of type ${typeof metaData}.`)

	// Set up the processor.
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple actions) or as have a single user (a single action).
		if (submissionData.submissions)
			return processGroupActions({ ...exerciseData, ...submissionData })
		return processUserAction({ ...exerciseData, ...submissionData })
	}
}
module.exports.getStepExerciseProcessor = getStepExerciseProcessor

// processUserAction is the processor for a single user and not a group.
function processUserAction(submissionData) {
	return processGroupActions({
		...submissionData,
		submissions: [{ action: submissionData.action }],
	})
}

// processGroupActions is the processor for a group of users.
function processGroupActions(submissionData) {
	if (submissionData.progress.split)
		return processStepActions(submissionData)
	return processMainProblemActions(submissionData)
}

function processMainProblemActions({ checkInput, metaData, getSolution, progress, submissions, state, history, updateSkills }) {
	// Get the solution of the exercise, if it exists.
	const solution = (typeof getSolution === 'function') && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

	// Check for all the input actions whether they are correct.
	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input')
			return false
		const input = toFO(submission.action.input, true)
		let currSolution = solution
		if (!currSolution && getSolution)
			currSolution = assembleSolution(getSolution, state, input)
		return checkInput({ state, input, solution: currSolution, metaData }, 0, 0)
	})
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp

	// Run the skill updates.
	submissions.forEach((submission, index) => {
		const { action, userId } = submission
		switch (action.type) {
			case 'input': // On an input, update the skills.
				updateSkills(metaData.skill, correct[index], userId)
				updateSkills(metaData.setup, correct[index], userId)
				return
			case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
				if (isDone && !hasPreviousInput(history, userId, 0))
					updateSkills(metaData.skill || metaData.setup, false, userId)
				return
			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	})

	// Determine the new progress.
	if (someCorrect)
		return { solved: true, done: true }
	if (allGaveUp)
		return nextStep({ split: true, step: 0 })
	return progress // Nothing changed.
}

function processStepActions(submissionData) {
	const { metaData, progress } = submissionData
	const step = getStep(progress)

	// Determine if it is a step with substeps and process accordingly.
	const skill = metaData.steps[step - 1]
	if (Array.isArray(skill))
		return processStepWithSubstepsActions(submissionData)
	return processStepWithoutSubstepsActions(submissionData)
}

function processStepWithoutSubstepsActions({ checkInput, metaData, getSolution, progress, submissions, state, history, updateSkills }) {
	// Get the solution of the exercise, if it exists and if there is some input action.
	const solution = (typeof getSolution === 'function') && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

	// Check for all the input actions whether they are correct.
	const step = getStep(progress)
	const correct = submissions.map(submission => {
		if (submission.action.type !== 'input')
			return false
		const input = toFO(submission.action.input, true)
		let currSolution = solution
		if (!currSolution && getSolution)
			currSolution = assembleSolution(getSolution, state, input)
		return checkInput({ state, input, solution: currSolution, metaData }, step, 0)
	})
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp

	// Run the skill updates for the skill of this step.
	const skill = metaData.steps[step - 1]
	submissions.forEach((submission, index) => {
		const { action, userId } = submission
		switch (action.type) {
			case 'input':
				return updateSkills(skill, correct[index], userId)
			case 'giveUp':
				if (isDone && !hasPreviousInput(history, userId, step))
					updateSkills(skill, false, userId)
				return
			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	})

	// Determine the new progress.
	const numSteps = metaData.steps.length
	if (someCorrect)
		return nextStep({ ...progress, [step]: { solved: true, done: true } }, numSteps)
	if (allGaveUp)
		return nextStep({ ...progress, [step]: { ...progress[step], givenUp: true, done: true } }, numSteps)
	return progress // Nothing changed.
}

function processStepWithSubstepsActions({ checkInput, metaData, getSolution, progress, submissions, state, history, updateSkills }) {
	const step = getStep(progress)
	const skill = metaData.steps[step - 1]
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const solution = (typeof getSolution === 'function') && submissions.some(submission => submission.action.type === 'input') ? getSolution(state) : undefined

	// We must have subskills (or this function won't be called) so walk through them and process them one by one.
	const stepProgress = { ...progress[step] }
	skill.forEach((subskill, index) => {
		// If the substep was already solved, ignore it.
		const substep = index + 1
		if (stepProgress[substep])
			return

		// Check for all the input actions whether they are correct.
		const correct = submissions.map(submission => {
			if (submission.action.type !== 'input')
				return false
			const input = toFO(submission.action.input, true)
			let currSolution = solution
			if (!currSolution && getSolution)
				currSolution = assembleSolution(getSolution, state, input)
			return checkInput({ state, input, solution: currSolution, metaData }, step, substep)
		})
		const someCorrect = correct.some(isCorrect => isCorrect)
		const isDone = someCorrect || allGaveUp

		// Run the skill updates for the skill of this step.
		submissions.forEach((submission, index) => {
			const { action, userId } = submission
			switch (action.type) {
				case 'input':
					return updateSkills(subskill, correct[index], userId)
				case 'giveUp':
					if (isDone && !hasPreviousInput(history, userId, step))
						updateSkills(subskill, false, userId)
					return
				default:
					throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
			}
		})

		// Update the step progress.
		stepProgress[substep] = someCorrect
	})

	// Determine the new progress, given the step progress.
	const numSteps = metaData.steps.length
	const everySubstepSolved = skill.every((_, index) => stepProgress[index + 1])
	if (everySubstepSolved)
		return nextStep({ ...progress, [step]: { ...stepProgress, solved: true, done: true } }, numSteps)
	if (allGaveUp)
		return nextStep({ ...progress, [step]: { ...progress[step], givenUp: true, done: true } }, numSteps)
	return { ...progress, [step]: stepProgress }
}

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
