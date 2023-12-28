import React, { useState, useEffect } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { isBasicObject, applyMapping } from 'step-wise/util'
import { toFO } from 'step-wise/inputTypes'

import { useLatest, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { useTranslator, addSection } from 'i18n'

import { useFormData } from '../Form'

import { FeedbackContext } from './context'
import { processFeedback } from './processing'

/* The FeedbackProvider takes the following properties.
 * - children: whatever is shown inside the Provider.
 * - input: the input which feedback should be given on. When it changes, the feedback is automatically updated.
 * - getFeedback: the function that is called when the input changes. When called, it is given an object { input: {...}, previousFeedback: {...}, previousInput: {...}, [...] }. All inputs are in FO format.
 * - data (default {}): an optional extra object with parameters that are then provided to the getFeedback function: see the [...] above. A common data object is { exerciseData: {...}, solution: {...} } but anything can be added.
 * The feedback object then makes the feedback available through the useFeedback(fieldId) hook.
 */
export function FeedbackProvider({ children, getFeedback, input, data = {} }) {
	const theme = useTheme()
	const translate = addSection(useTranslator(), 'feedback', false)

	// Set up a state to store the feedback and corresponding input to which that feedback was given.
	const [feedback, setFeedback] = useState({ result: {}, input: {} })
	const feedbackRef = useLatest(feedback)

	// Set up an updateFeedback handler.
	const { isAllInputEqual } = useFormData()
	const dataRef = useLatest(data)
	const updateFeedback = useStableCallback((input = {}) => {
		// Compare the new input with the previous input. When they are equal, do not evaluate.
		const { result: previousResult, input: previousInput } = feedbackRef.current
		if (isAllInputEqual(input, previousInput))
			return

		// If there is no input, then make sure there is no feedback either.
		if (!input || Object.keys(input).length === 0)
			return setFeedback({ result: {}, input: {} })

		// If there is a getFeedback function, call it with the given data, input, previous feedback and previous input. Make sure all input (which is given as SI) is in FO. Then process and store the resulting feedback.
		if (getFeedback) {
			const inputFO = toFO(input, true)
			const previousInputFO = toFO(previousInput, true)
			let result = getFeedback({ ...dataRef.current, input: inputFO, previousFeedback: previousResult, previousInput: previousInputFO, translate })
			if (!result || !isBasicObject(result))
				throw new Error(`Invalid feedback: a feedback was returned which is not an object. Instead, we received "${result}". Possibly the getFeedback function forgot to return anything sensible?`)
			result = applyMapping(result, fieldFeedback => processFeedback(fieldFeedback, theme))
			setFeedback({ result: result, input })
		}
	})

	// When the input to be given feedback on changes, update the feedback.
	useEffect(() => {
		if (input)
			updateFeedback(input)
	}, [input, updateFeedback])

	// Wrap a provider around the contents. Also export the updateFeedback, so instances may manually call for a change here, for instance when viewing submissions made by other students in the coop mode.
	return <FeedbackContext.Provider value={{ ...feedback, updateFeedback }}>{children}</FeedbackContext.Provider>
}
