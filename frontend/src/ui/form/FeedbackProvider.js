import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

import { IOtoFO } from 'step-wise/inputTypes'
import { getLastInput } from 'step-wise/edu/exercises/util/simpleExercise'

import { useRefWithValue } from '../../util/react'
import { useExerciseData, getPrevProgress } from '../edu/exercises/ExerciseContainer'

const FeedbackContext = createContext(null)

export default function FeedbackProvider({ children, getFeedback }) {
	const [feedback, setFeedback] = useState({})
	const [feedbackInput, setFeedbackInput] = useState({})
	const { state, progress, history, shared } = useExerciseData()
	const prevProgress = getPrevProgress(history)

	// Set up an updateFeedback handler.
	const dataRef = useRefWithValue({ getFeedback, state, progress, prevProgress, shared, feedback, feedbackInput })
	const updateFeedback = useCallback((input) => {
		const { getFeedback, state, progress, prevProgress, shared, feedback, feedbackInput } = dataRef.current
		setFeedbackInput(input)
		if (getFeedback)
			setFeedback(getFeedback({ state, input: IOtoFO(input), progress, prevProgress, shared, prevFeedback: feedback, prevInput: IOtoFO(feedbackInput) }))
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

// useParameterFeedback gives the feedback for a single parameter.
export function useParameterFeedback(name) {
	const { feedback, feedbackInput } = useFeedback()
	if (!feedbackInput)
		return { feedbackInput: null }
	return {
		feedback: feedback[name],
		feedbackInput: feedbackInput[name],
	}
}
