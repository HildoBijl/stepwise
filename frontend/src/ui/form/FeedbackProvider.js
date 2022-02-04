import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTheme } from '@material-ui/core/styles'

import { selectRandomCorrect, selectRandomIncorrect } from 'step-wise/util/random'
import { noop } from 'step-wise/util/functions'
import { deepEquals, processOptions } from 'step-wise/util/objects'
import { toFO } from 'step-wise/inputTypes'
import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import { useRefWithValue } from 'util/react'
import { getIcon, getFeedbackColor } from 'ui/theme'
import { useExerciseData, getPrevProgress } from 'ui/edu/exercises/ExerciseContainer'

import { removeCursor } from './inputs/support/FieldInput'
import { useInput, useFieldValidation } from './Form'

const FeedbackContext = createContext(null)

export default function FeedbackProvider({ children, getFeedback }) {
	const [feedback, setFeedback] = useState({})
	const [feedbackInput, setFeedbackInput] = useState({})
	const exerciseData = useExerciseData()
	const { history } = exerciseData
	const prevProgress = getPrevProgress(history)

	// Set up an updateFeedback handler.
	const dataRef = useRefWithValue({ ...exerciseData, getFeedback, prevProgress, feedback, feedbackInput })
	const updateFeedback = useCallback((input) => {
		const { getFeedback, prevProgress, feedback, feedbackInput } = dataRef.current
		setFeedbackInput(input)
		if (getFeedback) {
			const newFeedback = getFeedback({ ...dataRef.current, input: toFO(input, true), prevProgress, prevFeedback: feedback, prevInput: toFO(feedbackInput, true) })
			if (!newFeedback)
				throw new Error(`Invalid feedback: a feedback was returned which it not an object. Instead, we received "${newFeedback}". Possibly the getFeedback function forgot to return anything sensible?`)
			setFeedback(newFeedback)
		}
	}, [setFeedback, setFeedbackInput, dataRef])

	// After an input action is fully processed, update potential feedback.
	useEffect(() => {
		const lastInput = getLastInput(history)
		if (lastInput)
			updateFeedback(lastInput)
	}, [history, updateFeedback])

	// Wrap a provider around the contents.
	return <FeedbackContext.Provider value={{ feedback, feedbackInput, updateFeedback }}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
	return useContext(FeedbackContext)
}

// useParameterFeedback gives the raw feedback for a single parameter.
export function useParameterFeedback(id) {
	const { feedback, feedbackInput } = useFeedback()
	if (!feedbackInput)
		return { feedbackInput: null }
	return {
		feedback: feedback[id],
		feedbackInput: feedbackInput[id],
	}
}

/* useFieldFeedback examines results from validation and feedback to give an indication to the user about the most relevant feedback. It gets a processed object with options:
 * - id (obligatory): the id of the field we want to get the feedback of.
 * - subFields (default []): the ids of the subfields whose feedback should also be processed.
 * - validate (default noop): the validation function that must be applied for the field.
 * - feedbackText (default ''): a default feedback text if nothing is found from validation/feedback. Note that validation/feedback text take precedence over this fallback text.
 * An object is returned of the format { feedback, feedbackInput }. The feedback parameter has the following parameters.
 * - type: 'normal', 'warning', 'info', 'success', 'error' or so.
 * - text: 'Correct answer!' or any other type of feedback text.
 * - Icon: an icon if the type corresponds to an Icon, and null otherwise.
 * - color: the color that corresponds to the type, taken from the theme palette.
 */
export function useFieldFeedback(options) {
	const { id, subFields, validate, feedbackText } = processOptions(options, defaultFieldFeedbackOptions)

	// Gather data.
	let input = useInput(id, true)
	let { validation, validationInput } = useFieldValidation(id, validate)
	let { feedback, feedbackInput } = useParameterFeedback(id)
	const staticFeedbackText = useStaticFeedbackText(feedback, feedbackInput)
	const theme = useTheme()

	// Remove potential cursors for a proper comparison.
	input = removeCursor(input)
	validationInput = removeCursor(validationInput)
	feedbackInput = removeCursor(feedbackInput)

	// Check for validation problems.
	if (validation !== undefined && deepEquals(input, validationInput))
		return addInput(addIconAndColor({ type: 'warning', text: validation || feedbackText }, theme), validationInput)

	// Check for feedback.
	if (feedback !== undefined && deepEquals(input, feedbackInput)) {
		// Get the feedback object for the main field.
		const feedbackObject = processFeedback(feedback, staticFeedbackText || feedbackText, theme) || {}

		// Add feedback objects for any given subfields.
		subFields.forEach(subFieldId => {
			if (feedbackObject[subFieldId])
				throw new Error(`Invalid subfield ID "${subFieldId}". It is not allowed to use this subfield ID since it is used to give feedback.`)
			feedbackObject[subFieldId] = processFeedback(feedback[subFieldId], '', theme) // Due to react hooks constraints subfields cannot automatically get a static feedback text. (You cannot have a variable number of hooks.)
		})
		return addInput(feedbackObject, feedbackInput)
	}

	// No particular feedback found. Return default.
	return addInput(getDefaultFeedback(feedbackText, theme), feedbackInput)
}
export const defaultFieldFeedbackOptions = {
	id: undefined,
	subFields: [],
	validate: noop,
	feedbackText: '',
}

// useMainFeedback gives the feedback object for the "main" item.
export function useMainFeedback(step) {
	const theme = useTheme()
	const { feedback, feedbackInput } = useFeedback()
	const mainFeedback = ((step ? feedback[step] : feedback) || {}).main
	const staticFeedbackText = useStaticFeedbackText(mainFeedback, feedbackInput)
	return addInput(processFeedback(mainFeedback, staticFeedbackText, theme), feedbackInput)
}

// useStaticFeedbackText comes up with a feedback text when the feedback is just a boolean (true or false, for correct or incorrect). It ensures that this message stays the same until the dependency changes. If you don't do this, then the incorrect-message will change after every keypress.
function useStaticFeedbackText(feedback, dependency) {
	const [text, setText] = useState('')
	const feedbackRef = useRefWithValue(feedback)

	// Refresh the text on a change of input, if the feedback is boolean. Otherwise the text won't be used anyway.
	useEffect(() => {
		const feedback = feedbackRef.current
		const bool = getBooleanFromFeedback(feedback)
		if (bool !== undefined)
			setText(bool ? selectRandomCorrect() : selectRandomIncorrect())
	}, [feedbackRef, setText, dependency])

	// If the feedback is not boolean, the text will not be used.
	if (getBooleanFromFeedback(feedback) === undefined)
		return ''
	return text
}

/* processFeedback takes a feedback object of a variable form and turns it into the standard form the input fields expect. Input can be of the form:
 * - undefined: don't display feedback.
 * - true/false: a boolean just indicates whether something is correct or not.
 * - { correct: true/false, text: 'someString' }
 * - { main: false, subfield1: { correct: true, text: 'This one is correct' }, subfield2: {correct: false, text: 'This one is not' } }
 * - something already in the right format
 * The output will always be of the form { type: 'warning', text: 'Some possibly empty message.', icon: Icon, color: '#abcdef' }.
 */
function processFeedback(feedback, staticFeedbackText, theme) {
	// If the feedback is undefined, return default.
	if (feedback === undefined)
		return getDefaultFeedback('', theme)

	// If the feedback is boolean, set up the corresponding object.
	const bool = getBooleanFromFeedback(feedback)
	if (bool !== undefined) {
		const type = bool ? 'success' : 'error'
		return addIconAndColor({ type, text: staticFeedbackText }, theme)
	}

	// If there is no feedback, don't return anything.
	if (feedback.correct === undefined && !feedback.type && !feedback.text)
		return undefined

	// If the feedback is more detailed, show that too.
	return addIconAndColor({
		type: feedback.type || (feedback.correct !== undefined && (feedback.correct ? 'success' : 'error')) || 'normal',
		text: feedback.text || '',
	}, theme)
}

function getDefaultFeedback(feedbackText = '', theme) {
	if (feedbackText)
		return addIconAndColor({ type: 'normal', text: feedbackText }, theme)
	return undefined // This is to indicate no feedback is present.
}

function addInput(feedback, feedbackInput) {
	return { feedback, feedbackInput }
}

function addIconAndColor(feedback, theme) {
	const type = feedback.type
	const Icon = getIcon(type)
	const color = getFeedbackColor(type, theme)
	return {
		...feedback,
		Icon: Icon,
		color,
	}
}

function getBooleanFromFeedback(feedback) {
	if (typeof feedback === 'boolean')
		return feedback
	if (feedback && typeof feedback.main === 'boolean')
		return feedback.main
	return undefined
}