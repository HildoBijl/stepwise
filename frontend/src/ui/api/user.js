import { createContext, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

// Get the user data.
export function useUserQuery() {
	return useQuery(ME)
}
const ME = gql`{me{name,email}}`

// Allow user data to be stored in a context.
const UserContext = createContext(null)
export { UserContext }

export function useUserResults() {
	return useContext(UserContext)
}

export function useUser() {
	const res = useUserResults()
	return (res && res.data && res.data.me) || null
}

