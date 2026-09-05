import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { userFields } from '../user'

import { skillFields } from './util'

export const userWithSkillsFields = (addExercises) => userFields(`
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
