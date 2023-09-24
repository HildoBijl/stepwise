import { useFeedback as useFieldFeedback } from 'ui/form'

import { useInputId } from './main'

// useFeedback retrieves the full feedback object for the current input field: both the feedback itself as well as the input to which it was given.
export function useFeedback() {
	const id = useInputId()
	return useFieldFeedback(id)
}

// useFeedbackResult retrieves only the actually given feedback, and this is also given even if the input value has since changed.
export function useFeedbackResult() {
	return useFeedback().result
}

// useFeedbackInput retrieves only the input to which the feedback was given.
export function useFeedbackInput() {
	return useFeedback().input
}
