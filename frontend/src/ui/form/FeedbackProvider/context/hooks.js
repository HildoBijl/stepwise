import { isValidElement } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { isBasicObject } from 'step-wise/util/objects'

import { useFormData, useFieldValidation } from '../../Form'

import { processFeedback } from '../processing'

import { useFeedbackContext } from './provider'

// useRawFeedback gives the raw feedback for a field. (Or for all fields together if no ID is given.) It's the feedback without checking for validation issues.
export function useRawFeedback(id) {
	const { result, input } = useFeedbackContext()
	if (id === undefined)
		return { result, input }
	if (!input)
		return { result: undefined, input: undefined }
	return {
		result: result[id],
		input: input[id],
	}
}

/* useFeedback examines results from validation and feedback to give an indication to the user about the most relevant feedback. It gets the following parameters.
 * - id (obligatory): the id of the field we want to get the feedback of. (This must be given; the function won't work without an ID. It is not possible at this point, nor needed, to get all feedback of all parameters.)
 * 
 * An object is returned of the format { feedback, feedbackInput }. The feedback parameter has the following parameters.
 * - type: 'normal', 'warning', 'info', 'success', 'error' or so.
 * - text: 'Correct answer!' or any other type of feedback text.
 * - Icon: an icon if the type corresponds to an Icon, and null otherwise.
 * - color: the color that corresponds to the type, taken from the theme palette.
 */
export function useFeedback(id) {
	const theme = useTheme()

	// Gather data on validation and feedback.
	let { result: validationResult, input: validationInput } = useFieldValidation(id)
	let { result: feedbackResult, input: feedbackInput } = useRawFeedback(id)

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
	if (feedbackResult !== undefined && equals(input, feedbackInput))
		return addInput(feedbackResult, feedbackInput)

	// No particular feedback found.
	return addInput(undefined, feedbackInput)
}

// useMainFeedback gives the feedback object for the "main" item. A step can be added, in which case the main feedback for that step is given.
export function useMainFeedback(step) {
	const { result, input } = useFeedbackContext()
	const key = (step ? `step${step}main` : 'main')
	return addInput(result[key], input)
}

// useFeedbackInput just returns the full input object to which feedback was given.
export function useFeedbackInput(id) {
	return useRawFeedback(id).input
}

// addInput is a small support function that takes a feedback object and an input object and merges them into an object { feedback, feedbackInput } that can then be returned.
function addInput(result, input) {
	return { result, input }
}
