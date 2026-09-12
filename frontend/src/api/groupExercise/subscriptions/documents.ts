import { type TypedDocumentNode, gql } from '@apollo/client'

import type { GroupActionUpdateRecord, GroupEventResolutionRecord } from '../records.ts'
import { groupActionUpdateFields, groupEventResolutionFields } from '../fragments.ts'

export type GroupExerciseSubscriptionVariables = { exerciseId: string }

export type GroupActionUpdatedData = { groupActionUpdated: GroupActionUpdateRecord }
export type GroupEventResolvedData = { groupEventResolved: GroupEventResolutionRecord }

export const GROUP_ACTION_UPDATED: TypedDocumentNode<GroupActionUpdatedData, GroupExerciseSubscriptionVariables> = gql`
	subscription groupActionUpdated($exerciseId: ID!) {
		groupActionUpdated(exerciseId: $exerciseId) {
			${groupActionUpdateFields}
		}
	}
`

export const GROUP_EVENT_RESOLVED: TypedDocumentNode<GroupEventResolvedData, GroupExerciseSubscriptionVariables> = gql`
	subscription groupEventResolved($exerciseId: ID!) {
		groupEventResolved(exerciseId: $exerciseId) {
			${groupEventResolutionFields}
		}
	}
`
