import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useUserId } from '../../user/index.ts'

import type { GroupRecord, MyActiveGroupQueryData } from '../records.ts'
import { groupFields } from '../fragments.ts'

type MyActiveGroupUpdatedData = { myActiveGroupUpdated: GroupRecord }

const MY_ACTIVE_GROUP_UPDATED: TypedDocumentNode<MyActiveGroupUpdatedData, Record<string, never>> = gql`
	subscription myActiveGroupUpdated {
		myActiveGroupUpdated {
			${groupFields}
		}
	}
`

export function reconcileActiveGroupRecord(currentGroup: GroupRecord | null, updatedGroup: GroupRecord, userId: string | undefined): GroupRecord | null {
	const member = updatedGroup.members.find(member => member.userId === userId)
	if (member?.active) return updatedGroup
	if (currentGroup && currentGroup.code !== updatedGroup.code) return currentGroup
	return null
}

export function useMyActiveGroupSubscription(subscribeToMore: SubscribeToMoreFunction<MyActiveGroupQueryData, Record<string, never>>, apply = true): void {
	const userId = useUserId()
	useEffect(() => {
		if (!apply) return
		return subscribeToMore({
			document: MY_ACTIVE_GROUP_UPDATED,
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				const currentGroup = previousData.myActiveGroup
				const updatedGroup = subscriptionData.data?.myActiveGroupUpdated
				return { myActiveGroup: updatedGroup ? reconcileActiveGroupRecord(currentGroup, updatedGroup, userId) : currentGroup }
			},
		})
	}, [apply, subscribeToMore, userId])
}
