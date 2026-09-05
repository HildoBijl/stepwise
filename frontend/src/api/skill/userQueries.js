import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from '../user/fragments'

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
	return useQuery(USER_WITH_SKILLS, { variables: { userId } })
}

export const USER_WITH_SKILLS = gql`
	query userWithSkills($userId: ID!) {
		user(userId: $userId) {
			${userWithSkillsFields(true)}
		}
	}
	${USER_FRAGMENTS}
`
