import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useUserId } from '../../user/index.ts'

import type { GroupRecord, MyGroupsQueryData } from '../records.ts'
import { groupFields } from '../fragments.ts'
import { removeGroupRecord, upsertGroupRecord } from '../recordLists.ts'

type MyGroupsUpdatedData = { myGroupsUpdated: GroupRecord }

const MY_GROUPS_UPDATED: TypedDocumentNode<MyGroupsUpdatedData, Record<string, never>> = gql`
	subscription myGroupsUpdated {
		myGroupsUpdated {
			${groupFields}
		}
	}
`

export function useMyGroupsSubscription(
	subscribeToMore: SubscribeToMoreFunction<MyGroupsQueryData, Record<string, never>>,
	apply = true,
): void {
	const userId = useUserId()
	useEffect(() => {
		if (!apply) return
		return subscribeToMore({
			document: MY_GROUPS_UPDATED,
			updateQuery: (_unsafePreviousData, { complete, previousData, subscriptionData }) => {
				if (!complete) return
				const currentGroups = previousData.myGroups
				const updatedGroup = subscriptionData.data?.myGroupsUpdated
				if (!updatedGroup) return { myGroups: currentGroups }
				const groups = upsertGroupRecord(updatedGroup, currentGroups)
				return {
					myGroups: updatedGroup.members.some(member => member.userId === userId)
						? groups
						: removeGroupRecord(updatedGroup.code, groups),
				}
			},
		})
	}, [apply, subscribeToMore, userId])
}
