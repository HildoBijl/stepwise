import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { GroupExerciseQueryData, GroupExerciseQueryVariables, GroupExerciseRecord } from '../records.ts'
import { groupExerciseFields } from '../fragments.ts'

type GroupExerciseUpdatedData = { groupExerciseUpdated: GroupExerciseRecord }
type GroupExerciseUpdatedVariables = { exerciseId: string }

const GROUP_EXERCISE_UPDATED: TypedDocumentNode<GroupExerciseUpdatedData, GroupExerciseUpdatedVariables> = gql`
	subscription groupExerciseUpdated($exerciseId: ID!) {
		groupExerciseUpdated(exerciseId: $exerciseId) {
			${groupExerciseFields}
		}
	}
`

export function useGroupExerciseSubscription(
	exerciseId: string | undefined,
	subscribeToMore: SubscribeToMoreFunction<GroupExerciseQueryData, GroupExerciseQueryVariables>,
	apply = true,
): void {
	useEffect(() => {
		if (!apply || !exerciseId) return
		return subscribeToMore({
			document: GROUP_EXERCISE_UPDATED,
			variables: { exerciseId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				return { groupExercise: subscriptionData.data?.groupExerciseUpdated ?? previousData.groupExercise }
			},
		})
	}, [apply, exerciseId, subscribeToMore])
}
