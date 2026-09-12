import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { SkillId } from '@step-wise/skill-definition'

import type { GroupExerciseRecord, LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables } from '../records.ts'
import { groupExerciseFields } from '../fragments.ts'

type LatestGroupExerciseUpdatedData = { latestGroupExerciseUpdated: GroupExerciseRecord }
type LatestGroupExerciseUpdatedVariables = { code: string; skillId: SkillId }

const LATEST_GROUP_EXERCISE_UPDATED: TypedDocumentNode<LatestGroupExerciseUpdatedData, LatestGroupExerciseUpdatedVariables> = gql`
	subscription latestGroupExerciseUpdated($code: String!, $skillId: String!) {
		latestGroupExerciseUpdated(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

export function useLatestGroupExerciseSubscription(
	code: string | undefined,
	skillId: SkillId,
	subscribeToMore: SubscribeToMoreFunction<LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables>,
	apply = true,
): void {
	useEffect(() => {
		if (!apply || !code) return
		return subscribeToMore({
			document: LATEST_GROUP_EXERCISE_UPDATED,
			variables: { code, skillId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				return { latestGroupExercise: subscriptionData.data?.latestGroupExerciseUpdated ?? previousData.latestGroupExercise }
			},
		})
	}, [apply, code, skillId, subscribeToMore])
}
