import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/skill-definition'

import type { SkillWithExercisesRecord } from '../records.ts'
import type { UseSkillResult } from '../types.ts'
import { skillExerciseFields } from '../fragments.ts'
import { skillRecordToSkill } from '../conversion.ts'

type SkillQueryData = { skill: SkillWithExercisesRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }

export const SKILL_QUERY: TypedDocumentNode<SkillQueryData, SkillQueryVariables> = gql`
	query skill($skillId: String!, $userId: ID) {
		skill(skillId: $skillId, userId: $userId) {
			${skillExerciseFields}
		}
	}
`

export function useSkill(skillId: SkillId, userId?: string): UseSkillResult {
	const variables = { skillId, ...(userId ? { userId } : {}) }
	const { data, loading, error } = useQuery(SKILL_QUERY, { variables })
	const record = data?.skill
	const skill = useMemo(() => record ? skillRecordToSkill(record) : undefined, [record])
	return { skill, loading, error }
}
