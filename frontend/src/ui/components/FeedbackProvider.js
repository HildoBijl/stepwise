import React, { createContext, useContext, useState } from 'react'

import { useExerciseData } from './ExerciseContainer'
import { IOtoFO } from 'step-wise/edu/inputTransformation'

const FeedbackContext = createContext(null)

export default function FeedbackProvider({ children, getFeedback }) {
	const [feedback, setFeedback] = useState({})
	const [prevInput, setPrevInput] = useState(null)
	const { state, progress } = useExerciseData()

	const updateFeedback = (input) => {
		setPrevInput(input)
		if (getFeedback)
			setFeedback(getFeedback(state, IOtoFO(input), progress))
	}

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