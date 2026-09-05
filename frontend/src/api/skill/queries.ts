import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'
import { ensureSkillIds } from '@step-wise/skill-tree'

import { useUser } from '../user'

import type { SkillLevelRecord, SkillWithExercisesRecord } from './records.ts'
import { skillLevelRecordToData, skillRecordToSkill } from './conversion'
import { skillExerciseFields, skillLevelFields } from './fragments.ts'

type SkillQueryData = { skill: SkillWithExercisesRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }
export type SkillLevelRecordsQueryData = { skills: SkillLevelRecord[] }
export type SkillLevelRecordsQueryVariables = { skillIds: SkillId[] }

// Get the data for a skill.
export function useSkill(skillId: SkillId, userId?: string) {
	const variables = { skillId, ...(userId ? { userId } : {}) }
	const { data, loading, error } = useQuery(SKILL, { variables })
	const record = (data as SkillQueryData | undefined)?.skill
	const skill = useMemo(() => record ? skillRecordToSkill(record) : undefined, [record])
	return { skill, loading, error }
}
export const SKILL: TypedDocumentNode<SkillQueryData, SkillQueryVariables> = gql`
	query skill($skillId: String!, $userId: ID) {
		skill(skillId: $skillId, userId: $userId) {
			${skillExerciseFields}
		}
	}
`

// Load level data for multiple skills without loading exercise data.
export function useSkillLevelRecordsQuery(skillIds: SkillId[]) {
	skillIds = [...ensureSkillIds(skillIds)]
	const user = useUser()
	const skip = !user || skillIds.length === 0
	const result = useQuery(SKILL_LEVEL_RECORDS, { variables: { skillIds }, skip })
	const rawData = result.data as SkillLevelRecordsQueryData | undefined
	const data = useMemo(() => rawData ? { skills: rawData.skills.map(skillLevelRecordToData) } : undefined, [rawData])
	return { ...result, data }
}
const SKILL_LEVEL_RECORDS: TypedDocumentNode<SkillLevelRecordsQueryData, SkillLevelRecordsQueryVariables> = gql`
	query skillLevelRecords($skillIds: [String]!) {
		skills(skillIds: $skillIds) {
			${skillLevelFields}
		}
	}
`
