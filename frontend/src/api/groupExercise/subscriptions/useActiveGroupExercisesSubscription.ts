import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import type { ActiveGroupExercisesQueryData, ActiveGroupExercisesQueryVariables, GroupExerciseRecord } from '../records.ts'
import { groupExerciseFields } from '../fragments.ts'
import { upsertGroupExerciseRecord } from '../recordLists.ts'

type ActiveGroupExerciseUpdatedData = { activeGroupExercisesUpdated: GroupExerciseRecord }
type ActiveGroupExerciseUpdatedVariables = { code: string }

const ACTIVE_GROUP_EXERCISE_UPDATED: TypedDocumentNode<ActiveGroupExerciseUpdatedData, ActiveGroupExerciseUpdatedVariables> = gql`
	subscription activeGroupExercisesUpdated($code: String!) {
		activeGroupExercisesUpdated(code: $code) {
			${groupExerciseFields}
		}
	}
`

export function useActiveGroupExercisesSubscription(
	code: string | undefined,
	subscribeToMore: SubscribeToMoreFunction<ActiveGroupExercisesQueryData, ActiveGroupExercisesQueryVariables>,
	apply = true,
): void {
	useEffect(() => {
		if (!apply || !code) return
		return subscribeToMore({
			document: ACTIVE_GROUP_EXERCISE_UPDATED,
			variables: { code },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				const exercises = previousData.activeGroupExercises
				const updatedExercise = subscriptionData.data?.activeGroupExercisesUpdated
				return { activeGroupExercises: updatedExercise ? upsertGroupExerciseRecord(updatedExercise, exercises) : exercises }
			},
		})
	}, [apply, code, subscribeToMore])
}
