const { toFO } = require('../../../../inputTypes')

const { hasPreviousInput } = require('./util')

// getStepExerciseProcessor takes a checkInput function that checks the input for a StepExercise and returns a processAction function.
function getStepExerciseProcessor(checkInput, data) {
	return (submissionData) => {
		if (submissionData.progress.done)
			return submissionData.progress // Weird ... we're already done.

		// How to process this depends on if we're in a group (multiple actions) or as have a single user (a single action).
		if (submissionData.submissions)
			return processGroupActions({ checkInput, data, ...submissionData })
		return processUserAction({ checkInput, data, ...submissionData })
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

// processGroupActions is the processor for a single user and not a group.
function processGroupActions(submissionData) {
	if (submissionData.progress.split)
		return processStepActions(submissionData)
	return processMainProblemActions(submissionData)
}

function processMainProblemActions({ checkInput, data, progress, submissions, state, history, updateSkills }) {
	// Determine whether the individual users got the solution correct.
	const correct = submissions.map(submission => submission.action.type === 'input' && checkInput(state, toFO(submission.action.input, true), 0, 0))
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp

	// Run the skill updates.
	submissions.forEach((submission, index) => {
		const { action, userId } = submission
		switch (action.type) {
			case 'input': // On an input, update the skills.
				updateSkills(data.skill, correct[index], userId)
				updateSkills(data.setup, correct[index], userId)
				return
			case 'giveUp': // On a give-up, only update skills when the exercise is done and the user still hasn't tried anything. And then only update the skill (or the set-up, if the skill is not present), because the user seemingly hasn't even tried the steps.
				if (isDone && !hasPreviousInput(history, userId, 0))
					updateSkills(data.skill || data.setup, false, userId)
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
	const { data, progress } = submissionData
	const step = getStep(progress)

	// Determine if it is a step with substeps and process accordingly.
	const skill = data.steps[step - 1]
	if (Array.isArray(skill))
		return processStepWithSubstepsActions(submissionData)
	return processStepWithoutSubstepsActions(submissionData)
}

function processStepWithoutSubstepsActions({ checkInput, data, progress, submissions, state, history, updateSkills }) {
	// Determine whether the individual users got the solution correct.
	const step = getStep(progress)
	const correct = submissions.map(submission => submission.action.type === 'input' && checkInput(state, toFO(submission.action.input, true), step, 0))
	const someCorrect = correct.some(isCorrect => isCorrect)
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')
	const isDone = someCorrect || allGaveUp

	// Run the skill updates for the skill of this step.
	const skill = data.steps[step - 1]
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
	const numSteps = data.steps.length
	if (someCorrect)
		return nextStep({ ...progress, [step]: { solved: true, done: true } }, numSteps)
	if (allGaveUp)
		return nextStep({ ...progress, [step]: { ...progress[step], givenUp: true, done: true } }, numSteps)
	return progress // Nothing changed.
}

function processStepWithSubstepsActions({ checkInput, data, progress, submissions, state, history, updateSkills }) {
	const step = getStep(progress)
	const skill = data.steps[step - 1]
	const allGaveUp = submissions.every(submission => submission.action.type === 'giveUp')

	// We must have subskills (or this function won't be called) so walk through them and process them one by one.
	const stepProgress = { ...progress[step] }
	skill.forEach((subskill, index) => {
		// If the substep was already solved, ignore it.
		const substep = index + 1
		if (stepProgress[substep])
			return

		// Determine whether the individual users got the solution correct.
		const correct = submissions.map(submission => submission.action.type === 'input' && checkInput(state, toFO(submission.action.input, true), step, substep))
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
	const numSteps = data.steps.length
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