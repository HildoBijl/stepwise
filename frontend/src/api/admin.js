import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from './user/fragments'
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
	${USER_FRAGMENTS}
`

export function isTeacher(user) {
	return !!user && user.role === 'teacher'
}

export function isAdmin(user) {
	return !!user && user.role === 'admin'
}
