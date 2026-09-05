import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'
import { ensureSkillIds } from '@step-wise/skill-tree'

import { useUser } from '../user'

import type { SkillRecord } from './records.ts'
import type { UserSkill } from './types.ts'
import { skillRecordToSkill } from './conversion'
import { skillFields } from './fragments.ts'

type SkillQueryData = { skill: SkillRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }
export type SkillsQueryData = { skills: SkillRecord[] }
export type SkillsQueryVariables = { skillIds: SkillId[] }

// Get the data for a skill.
export function useSkillQuery(skillId: SkillId, userId?: string) {
	const variables = { skillId, ...(userId ? { userId } : {}) }
	const result = useQuery(SKILL, { variables })
	const rawData = result.data as SkillQueryData | undefined
	const data = useMemo(() => rawData ? { skill: rawData.skill ? skillRecordToSkill(rawData.skill) : null } : undefined, [rawData])
	return { ...result, data: data as { skill: UserSkill | null } | undefined }
}
export const SKILL: TypedDocumentNode<SkillQueryData, SkillQueryVariables> = gql`
	query skill($skillId: String!, $userId: ID) {
		skill(skillId: $skillId, userId: $userId) {
			${skillFields(true)}
		}
	}
`

// Get the data for multiple skills. In this case only coefficients are loaded, and not exercises.
export function useSkillsQuery(skillIds: SkillId[]) {
	skillIds = [...ensureSkillIds(skillIds)]
	const user = useUser()
	const skip = !user || skillIds.length === 0
	const result = useQuery(SKILLS, { variables: { skillIds }, skip })
	const rawData = result.data as SkillsQueryData | undefined
	const data = useMemo(() => rawData ? { skills: rawData.skills.map(skillRecordToSkill) } : undefined, [rawData])
	return { ...result, data: data as { skills: UserSkill[] } | undefined }
}
export const SKILLS: TypedDocumentNode<SkillsQueryData, SkillsQueryVariables> = gql`
	query skills($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillFields(false)}
		}
	}
`
