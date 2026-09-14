import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/module-tree-definition'

import type { SkillWithLatestExerciseRecord } from '../records.ts'
import type { UseSkillResult } from '../types.ts'
import { skillLatestExerciseFields } from '../fragments.ts'
import { skillWithLatestExerciseRecordToSkill } from '../conversion.ts'
import { useExerciseStartedSubscription, useExerciseSubscription } from '../subscriptions/index.ts'

type SkillQueryData = { skill: SkillWithLatestExerciseRecord | null }
type SkillQueryVariables = { skillId: SkillId; userId?: string }

export const SKILL_QUERY: TypedDocumentNode<SkillQueryData, SkillQueryVariables> = gql`
	query skill($skillId: String!, $userId: ID) {
		skill(skillId: $skillId, userId: $userId) {
			${skillLatestExerciseFields}
		}
	}
`

export function useSkill(skillId: SkillId, userId?: string): UseSkillResult {
	const variables = { skillId, ...(userId ? { userId } : {}) }
	const { data, loading, error, subscribeToMore, refetch } = useQuery(SKILL_QUERY, { variables })
	const record = data?.skill
	useExerciseStartedSubscription(skillId, subscribeToMore, !userId)
	useExerciseSubscription(record?.exerciseData?.latestExercise?.id, subscribeToMore, refetch, !userId)
	const skill = useMemo(() => record ? skillWithLatestExerciseRecordToSkill(record) : undefined, [record])
	return { skill, loading, error }
}
