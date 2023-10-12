import React, { createContext, useContext } from 'react'

import { useUserQuery } from './queries'

// Put the query results in a context, so there's a single source of truth.
const UserContext = createContext(null)
export function UserProvider({ children }) {
	const result = useUserQuery()
	return (
		<UserContext.Provider value={result}>
			{children}
		</UserContext.Provider>
	)
}

// A main hook to get the data out of the context.
export function useUserResult() {
	return useContext(UserContext)
}
