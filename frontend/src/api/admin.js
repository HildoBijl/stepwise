import { useQuery, gql } from '@apollo/client'

import { userFields } from './user'

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}

export function useAllUsersQuery() {
	return useQuery(ALLUSERS)
}
const ALLUSERS = gql`
	query allUsers {
		allUsers {
			${userFields(true, false)}
		}
	}
`
