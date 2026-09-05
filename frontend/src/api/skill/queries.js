import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { ensureSkillIds } from '@step-wise/skill-tree'

import { useUser, useUserId } from '../user'

import { skillRecordToSkill } from './conversion'
import { skillFields } from './util'

// Get the data for a skill.
export function useSkillQuery(skillId, userId) {
	const currentUserID = useUserId() // Always include the userId to ensure the cache is updated properly.
	const result = useQuery(SKILL, { variables: { skillId, userId: userId || currentUserID } })
	const data = useMemo(() => result.data ? { ...result.data, skill: result.data.skill ? skillRecordToSkill(result.data.skill) : null } : undefined, [result.data])
	return { ...result, data }
}
export const SKILL = gql`
	query skill($skillId: String!, $userId: ID) {
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
	const result = useQuery(SKILLS, { variables: { skillIds }, skip })
	const data = useMemo(() => result.data ? { ...result.data, skills: result.data.skills.map(skillRecordToSkill) } : undefined, [result.data])
	return { ...result, data }
}
export const SKILLS = gql`
	query skills($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillFields(false)}
		}
	}
`
