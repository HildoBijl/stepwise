import React, { createContext, useContext } from 'react'
import { useMutation, useQuery, gql } from '@apollo/client'

// Get the query results. It's recommended not to use this one externally but use the context results, to have a single source of truth. (GraphQL gives flaky results.)
function useUserQuery() {
	return useQuery(ME)
}
const ME = gql`
	{
		me {
			id
			name
			email
			givenName
			familyName
			role
			privacyPolicyConsent {
				version,
				acceptedAt,
				isLatestVersion,
			}
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

// Only get the user ID.
export function useUserId() {
	const user = useUser()
	return user?.id
}

// Check if user data is done loading.
export function useIsUserDataLoaded() {
	const res = useUserResults()
	return !!(res && res.data)
}

// Shut down (delete) an account.
export function useShutdownAccountMutation() {
	const [shutdownAccount, data] = useMutation(SHUTDOWN_ACCOUNT)
	const newShutdownAccount = (confirmEmail) => shutdownAccount({ variables: { confirmEmail } })
	return [newShutdownAccount, data]
}
const SHUTDOWN_ACCOUNT = gql`
	mutation shutdownAccount($confirmEmail: String!) {
		shutdownAccount(confirmEmail: $confirmEmail)
	}
`