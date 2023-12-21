import { createContext, useContext } from 'react'

// The RouteContext contains data on the current route: only about the page currently displayed.
export const RouteContext = createContext({})

export function useRoute() {
	return useContext(RouteContext)
}
