import { useEffect } from 'react'
import type { SubscribeToMoreFunction } from '@apollo/client'

import type { LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables } from '../records.ts'

import { type GroupActionUpdatedData, type GroupEventResolvedData, type GroupExerciseSubscriptionVariables, GROUP_ACTION_UPDATED, GROUP_EVENT_RESOLVED } from './documents.ts'
import { mergeGroupActionUpdate } from './mergeGroupActionUpdate.ts'
import { mergeGroupEventResolution } from './mergeGroupEventResolution.ts'

export function useLatestGroupExerciseSubscriptions(exerciseId: string | undefined, subscribeToMore: SubscribeToMoreFunction<LatestGroupExerciseQueryData, LatestGroupExerciseQueryVariables>, refetch: () => Promise<unknown>, apply = true): void {
	useEffect(() => {
		if (!apply || !exerciseId) return
		
		const unsubscribeActionUpdates = subscribeToMore<GroupActionUpdatedData, GroupExerciseSubscriptionVariables>({
			document: GROUP_ACTION_UPDATED,
			variables: { exerciseId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				const update = subscriptionData.data?.groupActionUpdated
				if (!update) return previousData
				return { latestGroupExercise: mergeGroupActionUpdate(previousData.latestGroupExercise, update, refetch) }
			},
		})

		const unsubscribeResolutions = subscribeToMore<GroupEventResolvedData, GroupExerciseSubscriptionVariables>({
			document: GROUP_EVENT_RESOLVED,
			variables: { exerciseId },
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				const resolution = subscriptionData.data?.groupEventResolved
				if (!resolution) return previousData
				return { latestGroupExercise: mergeGroupEventResolution(previousData.latestGroupExercise, resolution, refetch) }
			},
		})

		return () => {
			unsubscribeActionUpdates()
			unsubscribeResolutions()
		}
	}, [apply, exerciseId, refetch, subscribeToMore])
}
