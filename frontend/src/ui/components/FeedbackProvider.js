import React, { useContext, useState } from 'react'

import { useExerciseData } from './ExerciseContainer'
import { IOtoFO } from 'step-wise/edu/inputTransformation'

const FeedbackContext = React.createContext(null)

export default function FeedbackProvider({ children }) {
	const [feedback, setFeedback] = useState({})
	const [prevInput, setPrevInput] = useState(null)
	const { state, meta } = useExerciseData()

	const getFeedback = (input) => {
		setPrevInput(input)
		if (meta.getFeedback)
			setFeedback(meta.getFeedback(state, IOtoFO(input)))
	}

	return <FeedbackContext.Provider value={{ feedback, prevInput, getFeedback }}>{children}</FeedbackContext.Provider>
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