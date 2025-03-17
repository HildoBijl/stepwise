import { applyMapping } from 'step-wise/util'
import { performIndividualComparison } from 'step-wise/eduTools'

import { selectRandomCorrect, selectRandomIncorrect } from 'ui/form'

/* getMCFeedback provides a default feedback for multiple choice input fields. Currently this only works for single-input multiple choice and not multi-input. Parameters are:
 * - parameter: the parameter name (ID) of the field.
 * - exerciseData: all the data for the exercise in the standard format.
 * - options: an object with options.
 * The options object can contain the following.
 * - correct: the correct answer. It is used to determine if the given input is correct or not. If it is not given, it is attempted to be pulled out of the getSolution function.
 * - done: whether the question is done. If so, the correct answer will be displayed.
 * - step: if provided, the progress object is used to determine whether this question is done. Only used if "done" is not given.
 * - substep: if provided, the corresponding substep is checked.
 * - text: the text corresponding to each option, if it is selected. This is usually an array of strings/JSXs. If it is not an array, the given text is simply always shown.
 * - correctText: the text that is used upon a correct answer, if no text is given.
 * - incorrectText: the text that is used upon an incorrect answer, if no text is given.
 * The object returned is of the form { [name]: { subfields: { 0: { correct: false, text: 'Wrong!' }, 1: { correct: true } } } }
 */
export function getMCFeedback(exerciseData, parameterOptions = {}) {
	return applyMapping(parameterOptions, (currOptions, currParameter) => getIndividualMCFeedback(exerciseData, currParameter, currOptions))
}

// getIndividualMCFeedback returns the feedback for a single multiple choice field.
function getIndividualMCFeedback(exerciseData, currParameter, currOptions) {
	// If the options is an array, it's probably the text array.
	if (Array.isArray(currOptions))
		currOptions = { text: currOptions }

	// Extract given parameters.
	const { input, progress, solution, example } = exerciseData
	let { correct, done, step, substep, text, correctText, incorrectText } = currOptions

	// Attempt to get correct answer if not given.
	let currInput = input[currParameter]
	let currSolution = solution[currParameter]
	if (correct === undefined)
		correct = performIndividualComparison(currInput, currSolution, undefined, solution)

	// Attempt to determine "done". (Accept for examples. Because they can be retried, they're never done.)
	if (!example && done === undefined) {
		if (progress.done) {
			done = progress.done
		} else if (step !== undefined) {
			let currProgress = progress[step]
			if (substep !== undefined)
				currProgress = currProgress && currProgress[substep]
			done = currProgress?.done
		}
	}

	// If the exercise is done, show all correct answers.
	const feedback = {}
	currSolution = Array.isArray(currSolution) ? currSolution : [currSolution]
	if (done && currSolution !== undefined)
		currSolution.forEach(index => { feedback[index] = { correct: true, text: '' } })

	// If there is an input, show the feedback on this input.
	const processFeedbackText = (text, subfield, subfieldCorrect) => {
		if (typeof text === 'function')
			text = text(subfield, subfieldCorrect)
		return Array.isArray(text) ? text[currInput] : text
	}
	if (currInput !== undefined) {
		currInput = Array.isArray(currInput) ? currInput : [currInput]
		currInput.forEach(index => {
			const correct = currSolution.includes(index)
			let feedbackText = processFeedbackText(text, index, correct)
			if (!feedbackText)
				feedbackText = processFeedbackText(correct ? correctText : incorrectText, index, correct)
			if (!feedbackText)
				feedbackText = correct ? selectRandomCorrect() : selectRandomIncorrect()
			feedback[index] = {
				correct,
				text: feedbackText,
			}
		})
	}

	// Return the result in an appropriate format.
	return { subfields: feedback }
}
