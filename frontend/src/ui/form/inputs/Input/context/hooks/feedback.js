import { useFeedback as useFieldFeedback } from '../../../../'

import { useInputId } from './main'

// useFeedback retrieves the full feedback object for the current input field: both the feedback itself as well as the input to which it was given.
export function useFeedback() {
	const id = useInputId()
	return useFieldFeedback(id)
}

// useFeedbackValue retrieves only the actually given feedback.
export function useFeedbackValue() {
	return useFeedback().feedback
}

// useFeedbackInput retrieves only the input to which the feedback was given.
export function useFeedbackInput() {
	return useFeedback().feedbackInput
}
