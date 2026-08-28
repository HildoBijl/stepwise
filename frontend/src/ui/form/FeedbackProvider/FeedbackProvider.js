import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@mui/material'

import { isPlainObject, mapValues, pickKeys, deepEqual } from '@step-wise/js-utils'
import { interpretInputData } from '@step-wise/input-interpretation'

import { useLatest, useStableCallback } from 'util/index' // Unit test import issue: use 'util/index' because the test runner otherwise resolves Node's built-in util package.
import { useTranslator, addSection } from 'i18n'

import { useFormData } from '../Form'

import { FeedbackContext } from './context'
import { processFeedback } from './processing'

export const crossExerciseTranslationPath = `practice.crossExercise`

/* The FeedbackProvider takes the following properties.
 * - children: whatever is shown inside the Provider.
 * - input: the input which feedback should be given on. When it changes, the feedback is automatically updated.
 * - getFeedback: the function that is called when the input changes. When called, it receives current and previous input in both FO (`input`/`previousInput`) and SI (`rawInput`/`previousRawInput`) format, along with `previousFeedback` and any exercise data.
 * - data (default {}): an optional extra object with parameters that are then provided to the getFeedback function: see the [...] above. A common data object is { exerciseData: {...}, solution: {...} } but anything can be added.
 * The feedback object then makes the feedback available through the useFeedback(fieldId) hook.
 */
export function FeedbackProvider({ children, getFeedback, input, exerciseData = {} }) {
	const theme = useTheme()

	// Add some useful translation handlers.
	const rawTranslate = useTranslator()
	const translate = addSection(rawTranslate, `practice.${exerciseData.exerciseId}.feedback`, false)
	const translateCrossExercise = addSection(rawTranslate, crossExerciseTranslationPath, false) // Allows skill-wide feedback translation (cross-exercise) instead of exercise-bound feedback translation.

	// Set up state to store the feedback and corresponding input to which that feedback was given.
	const [feedback, setFeedback] = useState({ result: {}, input: {} })
	const feedbackRef = useLatest(feedback)
	const stateRef = useRef()

	// Set up an updateFeedback handler.
	const { isAllInputEqual } = useFormData()
	const exerciseDataRef = useLatest(exerciseData)
	const updateFeedback = useStableCallback((input = {}, state = {}) => {
		// Compare the new input with the previous input. When they are equal, and the state is equal too, do not evaluate.
		const { result: previousResult, input: previousInput } = feedbackRef.current
		if (isAllInputEqual(input, previousInput) && deepEqual(state, stateRef.current))
			return
		stateRef.current = state

		// If there is no input, then make sure there is no feedback either.
		if (!input || Object.keys(input).length === 0)
			return setFeedback({ result: {}, input: {} })

		// If there is a getFeedback function, call it with the given data, input, previous feedback and previous input. Make sure all input (which is given as SI) is in FO. Then process and store the resulting feedback.
		if (getFeedback) {
			const inputFO = interpretInputData(input)
			const previousInputFO = interpretInputData(previousInput)
			let result = getFeedback({
				...pickKeys(exerciseDataRef.current, ['history', 'state', 'metadata', 'shared', 'solution', 'parameters', 'example']),
				input: inputFO,
				rawInput: input,
				previousFeedback: previousResult,
				previousInput: previousInputFO,
				previousRawInput: previousInput,
				translate, translateCrossExercise,
			})
			if (!result || !isPlainObject(result))
				throw new Error(`Invalid feedback: a feedback was returned which is not an object. Instead, we received "${result}". Possibly the getFeedback function forgot to return anything sensible?`)
			result = mapValues(result, fieldFeedback => processFeedback(fieldFeedback, theme))
			setFeedback({ result: result, input })
		}
	})

	// When the input to be given feedback on changes, update the feedback. Also update on state changes, since some fields (like MultipleChoice) base their feedback on whether an exercise done to show the right answer.
	const { state } = exerciseData
	useEffect(() => {
		if (input)
			updateFeedback(input, state)
	}, [input, state, updateFeedback])

	// Wrap a provider around the contents. Also export the updateFeedback, so instances may manually call for a change here, for instance when viewing submissions made by other students in the coop mode.
	return <FeedbackContext.Provider value={{ ...feedback, updateFeedback }}>{children}</FeedbackContext.Provider>
}
