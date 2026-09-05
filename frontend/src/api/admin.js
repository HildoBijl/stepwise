import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from './user/fragments'
import { userWithSkillsFields, userWithSkillsRecordToUser } from './skill'

export function useAllUsersQuery() {
	const result = useQuery(ALLUSERS)
	const data = useMemo(() => result.data ? { ...result.data, allUsers: result.data.allUsers?.map(userWithSkillsRecordToUser) } : undefined, [result.data])
	return { ...result, data }
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
