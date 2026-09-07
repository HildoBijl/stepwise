import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useUserId } from '../../user/index.ts'

import type { GroupRecord } from '../records.ts'
import type { MyActiveGroupQueryData } from '../queries/useMyActiveGroup.ts'
import { groupFields } from '../fragments.ts'
import { reconcileActiveGroup } from '../reconciliation.ts'

type MyActiveGroupUpdatedData = { myActiveGroupUpdated: GroupRecord }

const MY_ACTIVE_GROUP_UPDATED: TypedDocumentNode<MyActiveGroupUpdatedData, Record<string, never>> = gql`
	subscription myActiveGroupUpdated {
		myActiveGroupUpdated {
			${groupFields}
		}
	}
`

export function useMyActiveGroupSubscription(subscribeToMore: SubscribeToMoreFunction<MyActiveGroupQueryData, Record<string, never>>, apply = true): void {
	const userId = useUserId()
	useEffect(() => {
		if (!apply) return
		return subscribeToMore({
			document: MY_ACTIVE_GROUP_UPDATED,
			updateQuery: (previousData, { subscriptionData }) => {
				const currentGroup = previousData.myActiveGroup as GroupRecord | null
				const updatedGroup = subscriptionData.data?.myActiveGroupUpdated
				return { myActiveGroup: updatedGroup ? reconcileActiveGroup(currentGroup, updatedGroup, userId) : currentGroup }
			},
		})
	}, [apply, subscribeToMore, userId])
}
