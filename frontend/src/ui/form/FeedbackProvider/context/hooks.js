import { isValidElement } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { isBasicObject } from 'step-wise/util/objects'

import { useFormData, useFieldValidation } from '../../Form'

import { processFeedback } from '../processing'

import { useFeedbackContext } from './provider'

// useFeedbackInput just returns the full input object to which feedback was given.
export function useFeedbackInput() {
	return useFeedbackContext().feedbackInput
}

// useRawFieldFeedback gives the raw feedback for a single parameter. It's the feedback without checking for validation issues.
export function useRawFieldFeedback(id) {
	const { feedback, feedbackInput } = useFeedbackContext()
	if (!feedbackInput)
		return { feedback: undefined, feedbackInput: undefined }
	return {
		feedback: feedback[id],
		feedbackInput: feedbackInput[id],
	}
}

/* useFieldFeedback examines results from validation and feedback to give an indication to the user about the most relevant feedback. It gets the following parameters.
 * - id (obligatory): the id of the field we want to get the feedback of.
 * 
 * An object is returned of the format { feedback, feedbackInput }. The feedback parameter has the following parameters.
 * - type: 'normal', 'warning', 'info', 'success', 'error' or so.
 * - text: 'Correct answer!' or any other type of feedback text.
 * - Icon: an icon if the type corresponds to an Icon, and null otherwise.
 * - color: the color that corresponds to the type, taken from the theme palette.
 */
export function useFieldFeedback(id) {
	const theme = useTheme()

	// Gather data on validation and feedback.
	let { result: validationResult, input: validationInput } = useFieldValidation(id)
	let { feedback, feedbackInput } = useRawFieldFeedback(id)

	// Check if the field exists.
	const { getInputSI, getFieldData } = useFormData()
	const input = getInputSI(id)
	if (input === undefined)
		return addInput(undefined, input) // No feedback can be determined yet.

	// Check for validation problems. On a validation problem, the feedback to be given still needs to be processed.
	const equals = getFieldData(id).equals
	if (validationResult !== undefined && equals(input, validationInput)) {
		// If the validation result is not a full object, but a string (text) or React element (which is usually the case) then use this as text for the feedback. Also process it to still add an icon and a color.
		if (!isBasicObject(validationResult) || isValidElement(validationResult))
			validationResult = { text: validationResult }
		return addInput(processFeedback({ type: 'warning', ...validationResult }, theme), validationInput)
	}

	// Validation is fine. Check for regular feedback. If it exists, it's already been processed.
	if (feedback !== undefined && equals(input, feedbackInput)) {
		return addInput(feedback, feedbackInput)
	}

	// No particular feedback found.
	return addInput(undefined, feedbackInput)
}

// useMainFeedback gives the feedback object for the "main" item.
export function useMainFeedback(step) {
	const { feedback, feedbackInput } = useFeedbackContext()
	const key = (step ? `step${step}main` : 'main')
	return addInput(feedback[key], feedbackInput)
}

// addInput is a small support function that takes a feedback object and an input object and merges them into an object { feedback, feedbackInput } that can then be returned.
function addInput(feedback, feedbackInput) {
	return { feedback, feedbackInput }
}
