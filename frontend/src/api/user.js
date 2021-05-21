import React, { createContext, useContext } from 'react'
import { useQuery, gql } from '@apollo/client'

// Get the query results. It's recommended not to use this one externally but use the context results, to have a single source of truth. (GraphQL gives flaky results.)
function useUserQuery() {
	return useQuery(ME)
}
const ME = gql`
	{
		me {
			name
			email
			givenName
			familyName
			role
		}
	}
`

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

// Get the data out of the context.
export function useUserResults() {
	return useContext(UserContext)
}

// Only get the resulting user.
export function useUser() {
	const res = useUserResults()
	return (res && res.data && res.data.me) || null
}

// Check if user data is done loading.
export function useIsUserDataLoaded() {
	const res = useUserResults()
	return !!(res && res.data)
}