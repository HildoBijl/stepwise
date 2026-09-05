import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from '../user/fragments'

import { userWithSkillsRecordToUser } from './conversion'
import { skillFields } from './util'

export const userWithSkillsFields = (addExercises) => `
		...UserPublicFields
		sharedData {
			...UserSharedDataFields
			skills {
				${skillFields(addExercises)}
			}
		}
		accountData {
			...UserAccountDataFields
		}
`

export function useUserWithSkillsQuery(userId) {
	const result = useQuery(USER_WITH_SKILLS, { variables: { userId } })
	const data = useMemo(() => result.data ? { ...result.data, user: result.data.user ? userWithSkillsRecordToUser(result.data.user) : null } : undefined, [result.data])
	return { ...result, data }
}

export const USER_WITH_SKILLS = gql`
	query userWithSkills($userId: ID!) {
		user(userId: $userId) {
			${userWithSkillsFields(true)}
		}
	}
	${USER_FRAGMENTS}
`
