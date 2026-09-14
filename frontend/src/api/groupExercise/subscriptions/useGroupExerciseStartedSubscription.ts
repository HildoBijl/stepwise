import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { SkillId } from '@step-wise/module-tree-definition'

import type { GroupExerciseRecord, LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables } from '../records.ts'
import { groupExerciseFields } from '../fragments.ts'

type GroupExerciseStartedData = { groupExerciseStarted: GroupExerciseRecord }
type GroupExerciseStartedVariables = { code: string; skillId: SkillId }

const GROUP_EXERCISE_STARTED: TypedDocumentNode<GroupExerciseStartedData, GroupExerciseStartedVariables> = gql`
	subscription groupExerciseStarted($code: String!, $skillId: String!) {
		groupExerciseStarted(code: $code, skillId: $skillId) {
			${groupExerciseFields}
		}
	}
`

export function useGroupExerciseStartedSubscription(code: string | undefined, skillId: SkillId, subscribeToMore: SubscribeToMoreFunction<LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables>, apply = true): void {
	useEffect(() => {
		if (!apply || !code) return
		return subscribeToMore({
			document: GROUP_EXERCISE_STARTED,
			variables: { code, skillId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				return { latestGroupExercise: subscriptionData.data?.groupExerciseStarted ?? previousData.latestGroupExercise }
			},
		})
	}, [apply, code, skillId, subscribeToMore])
}
