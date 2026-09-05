import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { getUserFields } from '../user/queries'

import { skillFields } from './util'

export const userWithSkillsFields = (addExercises) => getUserFields(`
		skills {
			${skillFields(addExercises)}
		}
`)

export function useUserWithSkillsQuery(userId) {
	return useQuery(USER_WITH_SKILLS, { variables: { userId } })
}

export const USER_WITH_SKILLS = gql`
	query userWithSkills($userId: ID!) {
		user(userId: $userId) {
			${userWithSkillsFields(true)}
		}
	}
`
