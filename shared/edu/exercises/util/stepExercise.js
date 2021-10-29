import { setIOtoFO } from '../../../inputTypes'
import { ensureInt } from '../../../util/numbers'

// getStepExerciseProcessor takes a checkInput function that checks the input for a StepExercise and returns a processAction function.
export function getStepExerciseProcessor(checkInput, data) {
	const numSteps = data.steps.length
	return ({ progress, action, state, history, updateSkills }) => {
		if (progress.done)
			return progress // Weird ... we're already done.

		const step = getStep(progress)
		switch (action.type) {
			case 'input':
				// Are we in the main problem?
				if (!progress.split) {
					const correct = checkInput(state, setIOtoFO(action.input), 0, 0)
					if (correct) {
						updateSkills(data.skill, true)
						updateSkills(data.setup, true)
						return { solved: true, done: true }
					} else {
						updateSkills(data.skill, false)
						updateSkills(data.setup, false)
						return progress // Nothing changed.
					}
				}

				// We're at a step. But are there substeps too?
				const skill = data.steps[step - 1]
				if (Array.isArray(skill)) {
					// There are substeps. Walk through them and, if they haven't been solved, check them one by one.
					const stepProgress = { ...progress[step] }
					skill.forEach((subskill, index) => {
						const substep = index + 1
						if (stepProgress[substep])
							return // Already solved before.
						const correct = checkInput(state, setIOtoFO(action.input), step, substep)
						stepProgress[substep] = correct
						updateSkills(subskill, correct)
					})

					// If all substeps are solved, go to the next step. Otherwise stay.
					if (skill.every((_, index) => stepProgress[index + 1]))
						return nextStep({ ...progress, [step]: { ...stepProgress, solved: true, done: true } }, numSteps)
					else
						return { ...progress, [step]: stepProgress }
				} else {
					// No substeps; just a regular step. Check it and update skills/progress accordingly.
					const correct = checkInput(state, setIOtoFO(action.input), step, 0)
					updateSkills(skill, correct)
					if (correct)
						return nextStep({ ...progress, [step]: { solved: true, done: true } }, numSteps)
					else
						return progress // Nothing changed.
				}

			case 'giveUp':
				// Give up on the main problem? Then split.
				if (!progress.split) {
					if (history.length === 0) { // If no input has been submitted for this step, then downgrade it.
						// Don't penalize subskills when it can be avoided: apparently the student didn't know the steps. But when the exercise is not connected to a skill, then do penalize subskills.
						if (data.skill)
							updateSkills(data.skill, false)
						else
							updateSkills(data.setup, false)
					}
					return nextStep({ split: true, step: 0 })
				}

				// Give up on a step? If no input has been submitted for this step, then downgrade it.
				const eventAtStepWithInput = history.find((event, index) => {
					const action = event.action
					const prevProgress = (index === 0 ? {} : history[index - 1].progress)
					const prevStep = getStep(prevProgress)
					return step === prevStep && action.type === 'input'
				})
				if (!eventAtStepWithInput) {
					// Check if there are substeps which we should treat one by one, or just one step.
					const skill = data.steps[step - 1]
					if (Array.isArray(skill)) {
						skill.forEach(subskill => updateSkills(subskill, false))
					} else {
						updateSkills(skill, false)
					}
				}

				// Set up the new progress and return it.
				return nextStep({ ...progress, [step]: { ...progress[step], givenUp: true, done: true } }, numSteps)

			default:
				throw new Error(`Invalid action type: the action type "${action.type}" is unknown and cannot be processed.`)
		}
	}
}

// getStep takes a progress object and returns the step which this problem is at.
export function getStep(progress) {
	return progress.split ? progress.step : 0
}

// isStepSolved checks, from the progress object, whether the given step is solved. If no step is given, it checks the main exercise.
export function isStepSolved(progress, step) {
	if (!step)
		return !!progress.solved
	return !!(progress[step] || {}).solved
}

// isSubStepSolved checks, from the progress object, whether the given substep is solved.
export function isSubstepSolved(progress, step, substep) {
	// Check input.
	step = ensureInt(step, true, true)
	substep = ensureInt(substep, true, true)

	// Look up the progress.
	if (!progress[step])
		return false
	return !!progress[step][substep]
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
