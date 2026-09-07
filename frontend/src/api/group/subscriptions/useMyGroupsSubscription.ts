import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useUserId } from '../../user/index.ts'

import type { GroupRecord } from '../records.ts'
import type { MyGroupsQueryData } from '../queries/useMyGroups.ts'
import { groupFields } from '../fragments.ts'
import { addGroupToList, removeGroupFromList } from '../reconciliation.ts'

type MyGroupsUpdatedData = { myGroupsUpdated: GroupRecord }

const MY_GROUPS_UPDATED: TypedDocumentNode<MyGroupsUpdatedData, Record<string, never>> = gql`
	subscription myGroupsUpdated {
		myGroupsUpdated {
			${groupFields}
		}
	}
`

export function useMyGroupsSubscription(subscribeToMore: SubscribeToMoreFunction<MyGroupsQueryData, Record<string, never>>): void {
	const userId = useUserId()
	useEffect(() => subscribeToMore({
		document: MY_GROUPS_UPDATED,
		updateQuery: (previousData, { subscriptionData }) => {
			const currentGroups = previousData.myGroups as GroupRecord[]
			const updatedGroup = subscriptionData.data?.myGroupsUpdated
			if (!updatedGroup) return { myGroups: currentGroups }
			const groups = addGroupToList(updatedGroup, currentGroups)
			return {
				myGroups: updatedGroup.members.some(member => member.userId === userId)
					? groups
					: removeGroupFromList(updatedGroup.code, groups),
			}
		},
	}), [subscribeToMore, userId])
}
