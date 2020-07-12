import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

import { lastOf } from 'step-wise/util/arrays'
import { IOtoFO } from 'step-wise/edu/inputTransformation'
import { useRefWithValue } from '../../../util/react'
import { useExerciseData, getPrevProgress } from '../ExerciseContainer'

const FeedbackContext = createContext(null)

export default function FeedbackProvider({ children, getFeedback }) {
	const [feedback, setFeedback] = useState({})
	const [prevInput, setPrevInput] = useState(null)
	const { state, progress, history, shared } = useExerciseData()
	const prevProgress = getPrevProgress(history)

	// Set up an updateFeedback handler.
	const dataRef = useRefWithValue({ getFeedback, state, progress, prevProgress, shared })
	const updateFeedback = useCallback((input) => {
		const { getFeedback, state, progress, prevProgress, shared } = dataRef.current
		setPrevInput(input)
		if (getFeedback)
			setFeedback(getFeedback({ state, input: IOtoFO(input), progress, prevProgress, shared }))
	}, [setFeedback, setPrevInput, dataRef])

	// After an input action is fully processed, update potential feedback.
	useEffect(() => {
		const lastHistoryItem = lastOf(history)
		if (lastHistoryItem && lastHistoryItem.action && lastHistoryItem.action.type === 'input')
			updateFeedback(lastHistoryItem.action.input)
	}, [history, updateFeedback])

	// Wrap a provider around the contents.
	return <FeedbackContext.Provider value={{ prevInput, feedback, updateFeedback }}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
	return useContext(FeedbackContext)
}

// useParameterFeedback gives the feedback for a single parameter.
export function useParameterFeedback(name) {
	const { feedback, prevInput } = useFeedback()
	if (!prevInput)
		return { prevInput: null }
	return {
		prevInput: prevInput[name],
		feedback: feedback[name],
	}
}
