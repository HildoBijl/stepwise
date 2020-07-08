import React, { createContext, useContext, useState, useCallback } from 'react'

import { useRefWithValue } from '../../util/react'
import { useExerciseData } from './ExerciseContainer'
import { IOtoFO } from 'step-wise/edu/inputTransformation'

const FeedbackContext = createContext(null)

export default function FeedbackProvider({ children, getFeedback }) {
	const [feedback, setFeedback] = useState({})
	const [prevInput, setPrevInput] = useState(null)
	const { state, progress } = useExerciseData()

	// Put the data in a ref to prevent the updateFeedback function from changing.
	const dataRef = useRefWithValue({ getFeedback, state, progress})
	const updateFeedback = useCallback((input) => {
		const { getFeedback, state, progress } = dataRef.current
		setPrevInput(input)
		if (getFeedback)
			setFeedback(getFeedback(state, IOtoFO(input), progress))
	}, [setFeedback, setPrevInput, dataRef])

	return <FeedbackContext.Provider value={{ prevInput, feedback, updateFeedback }}>{children}</FeedbackContext.Provider>
}

export function useFeedback() {
	return useContext(FeedbackContext)
}

export function useParameterFeedback(name) {
	const { feedback, prevInput } = useFeedback()
	if (!prevInput)
		return { prevInput: null }
	return {
		prevInput: prevInput[name],
		feedback: (feedback[name] === undefined ? feedback.all : feedback[name]),
	}
}