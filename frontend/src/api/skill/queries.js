import { gql, useQuery } from '@apollo/client'

import { ensureSkillIds } from 'step-wise/eduTools'

import { useUser } from '../user'

import { skillFields } from './util'

// Get the data for a skill.
export function useSkillQuery(skillId, userId) {
	return useQuery(SKILL, { variables: { skillId, userId } })
}
export const SKILL = gql`
	query skill($skillId: String!, $userId: ID!) {
		skill(skillId: $skillId, userId: $userId) {
			${skillFields(true)}
		}
	}
`

// Get the data for multiple skills. In this case only coefficients are loaded, and not exercises.
export function useSkillsQuery(skillIds) {
	skillIds = ensureSkillIds(skillIds)
	const user = useUser()
	const skip = !user || skillIds.length === 0
	return useQuery(SKILLS, { variables: { skillIds }, skip })
}
export const SKILLS = gql`
	query skills($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillFields(false)}
		}
	}
`
