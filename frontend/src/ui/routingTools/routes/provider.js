import { createContext, useContext } from 'react'

// The Routes context will store all routes for the entire website, updating them when for instance the user data changes.
export const RoutesContext = createContext({})

export function useRoutes() {
	return useContext(RoutesContext)
}
