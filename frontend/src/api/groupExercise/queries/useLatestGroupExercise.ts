import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { SkillId } from '@step-wise/module-tree-definition'

import type { LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables } from '../records.ts'
import type { UseLatestGroupExerciseResult } from '../types.ts'
import { groupExerciseFields } from '../fragments.ts'
import { groupExerciseRecordToExercise } from '../conversion.ts'
import { useGroupExerciseStartedSubscription, useLatestGroupExerciseSubscriptions } from '../subscriptions/index.ts'

export const LATEST_GROUP_EXERCISE_QUERY: TypedDocumentNode<LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables> = gql`
	query latestGroupExercise($code: String!, $skillId: String!) {
		latestGroupExercise(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

export function useLatestGroupExercise(code: string | undefined, skillId: SkillId, apply = true): UseLatestGroupExerciseResult {
	const skip = !apply || !code
	const { data, loading, error, subscribeToMore, refetch } = useQuery(LATEST_GROUP_EXERCISE_QUERY, {
		variables: { code: code ?? '', skillId },
		skip,
	})
	const record = data?.latestGroupExercise
	useGroupExerciseStartedSubscription(code, skillId, subscribeToMore, !skip)
	useLatestGroupExerciseSubscriptions(record?.id, subscribeToMore, refetch, !skip)
	const exercise = useMemo(() => record ? groupExerciseRecordToExercise(record) : undefined, [record])
	return { exercise, loading, error }
}
