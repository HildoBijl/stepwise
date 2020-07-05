import React, { createContext, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import { apiAddress } from './settings'

const ME = gql`{me{name,email}}`

const UserContext = createContext(null)
export { UserContext }

export function useUserQuery() {
	return useQuery(ME)
}

export function useUserResults() {
	return useContext(UserContext)
}

export function useUser() {
	const res = useUserResults()
	return (res && res.data && res.data.me) || null
}

// LogOut is a React component that, once you mount it, logs the user out.
export function LogOut() {
	window.location.href = `${apiAddress}/auth/logout`
	return <p>Goodbye!</p> // ToDo: turn into some fancy loader? Or someone waving goodbye?
}
