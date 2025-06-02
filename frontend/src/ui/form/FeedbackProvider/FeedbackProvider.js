import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { isBasicObject, applyMapping, filterProperties, deepEquals } from 'step-wise/util'
import { toFO } from 'step-wise/inputTypes'
import { getExerciseName } from 'step-wise/eduTools'

import { useLatest, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.
import { useTranslator, addSection } from 'i18n'

import { useFormData } from '../Form'

import { FeedbackContext } from './context'
import { processFeedback } from './processing'

export const crossExerciseTranslationPath = `practice.crossExercise`

/* The FeedbackProvider takes the following properties.
 * - children: whatever is shown inside the Provider.
 * - input: the input which feedback should be given on. When it changes, the feedback is automatically updated.
 * - getFeedback: the function that is called when the input changes. When called, it is given an object { input: {...}, previousFeedback: {...}, previousInput: {...}, [...] }. All inputs are in FO format.
 * - data (default {}): an optional extra object with parameters that are then provided to the getFeedback function: see the [...] above. A common data object is { exerciseData: {...}, solution: {...} } but anything can be added.
 * The feedback object then makes the feedback available through the useFeedback(fieldId) hook.
 */
export function FeedbackProvider({ children, getFeedback, input, exerciseData = {} }) {
	const theme = useTheme()

	// Add some useful translation handlers.
	const rawTranslate = useTranslator()
	const translate = addSection(rawTranslate, `practice.${getExerciseName(exerciseData.exerciseId)}.feedback`, false)
	const translateCrossExercise = addSection(rawTranslate, crossExerciseTranslationPath, false) // Allows skill-wide feedback translation (cross-exercise) instead of exercise-bound feedback translation.

	// Set up a state to store the feedback and corresponding input to which that feedback was given.
	const [feedback, setFeedback] = useState({ result: {}, input: {} })
	const feedbackRef = useLatest(feedback)
	const progressRef = useRef()

	// Set up an updateFeedback handler.
	const { isAllInputEqual } = useFormData()
	const exerciseDataRef = useLatest(exerciseData)
	const updateFeedback = useStableCallback((input = {}, progress = {}) => {
		// Compare the new input with the previous input. When they are equal, and the progress is equal too, do not evaluate.
		const { result: previousResult, input: previousInput } = feedbackRef.current
		if (isAllInputEqual(input, previousInput) && deepEquals(progress, progressRef.currect))
			return
		progressRef.current = progress

		// If there is no input, then make sure there is no feedback either.
		if (!input || Object.keys(input).length === 0)
			return setFeedback({ result: {}, input: {} })

		// If there is a getFeedback function, call it with the given data, input, previous feedback and previous input. Make sure all input (which is given as SI) is in FO. Then process and store the resulting feedback.
		if (getFeedback) {
			const inputFO = toFO(input, true)
			const previousInputFO = toFO(previousInput, true)
			let result = getFeedback({
				...filterProperties(exerciseDataRef.current, ['history', 'progress', 'metaData', 'shared', 'solution', 'state', 'example']),
				input: inputFO,
				previousFeedback: previousResult,
				previousInput: previousInputFO,
				translate, translateCrossExercise,
			})
			if (!result || !isBasicObject(result))
				throw new Error(`Invalid feedback: a feedback was returned which is not an object. Instead, we received "${result}". Possibly the getFeedback function forgot to return anything sensible?`)
			result = applyMapping(result, fieldFeedback => processFeedback(fieldFeedback, theme))
			setFeedback({ result: result, input })
		}
	})

	// When the input to be given feedback on changes, update the feedback. Also update on progress changes, since some fields (like MultipleChoice) base their feedback on whether an exercise done to show the right answer.
	const { progress } = exerciseData
	useEffect(() => {
		if (input)
			updateFeedback(input, progress)
	}, [input, progress, updateFeedback])

	// Wrap a provider around the contents. Also export the updateFeedback, so instances may manually call for a change here, for instance when viewing submissions made by other students in the coop mode.
	return <FeedbackContext.Provider value={{ ...feedback, updateFeedback }}>{children}</FeedbackContext.Provider>
}
