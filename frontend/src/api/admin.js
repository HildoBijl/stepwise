import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { userWithSkillsFields } from './skill'

export function useAllUsersQuery() {
	return useQuery(ALLUSERS)
}
const ALLUSERS = gql`
	query allUsers {
		allUsers {
			${userWithSkillsFields(false)}
		}
	}
`

export function isTeacher(user) {
	return !!user && user.role === 'teacher'
}

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}
