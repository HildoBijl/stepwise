import { useFeedback as useFieldFeedback, useFeedbackToDisplay as useFieldFeedbackToDisplay } from 'ui/form'

import { useInputId } from './main'

// useFeedback retrieves the full feedback object for the current input field: both the feedback itself as well as the input to which it was given.
export function useFeedback() {
	const id = useInputId()
	return useFieldFeedback(id)
}

// useFeedbackToDisplay retrieves the feedback to be displayed if the input still equals the feedback input, and otherwise gives undefined.
export function useFeedbackToDisplay() {
	const id = useInputId()
	return useFieldFeedbackToDisplay(id)
}

// useFeedbackResult retrieves only the actually given feedback.
export function useFeedbackResult() {
	return useFeedback().result
}

// useFeedbackInput retrieves only the input to which the feedback was given.
export function useFeedbackInput() {
	return useFeedback().input
}
