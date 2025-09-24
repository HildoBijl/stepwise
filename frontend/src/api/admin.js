import { useQuery, gql } from '@apollo/client'

import { userFields } from './user'

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}

export function useUserQuery(userId, skillIds) {
	return useQuery(USER, { variables: { userId, skillIds } })
}
const USER = gql`
	query user($userId: ID!) {
		user(userId: $userId) {
			${userFields(true, true)}
		}
	}
`

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
