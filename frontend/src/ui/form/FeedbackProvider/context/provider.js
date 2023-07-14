import { createContext, useContext } from 'react'

export const FeedbackContext = createContext({})

export function useFeedbackContext() {
	return useContext(FeedbackContext)
}
