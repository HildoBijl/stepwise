import { createContext, useContext } from 'react'

export const FeedbackContext = createContext({})

// Any consuming element can access the context.
export function useFeedbackContext() {
	return useContext(FeedbackContext)
}
