import { useEffect } from 'react'
import { type SubscribeToMoreFunction, type TypedDocumentNode, gql } from '@apollo/client'

import { useUserId } from '../user/index.ts'

import type { GroupRecord } from './records.ts'
import type { MyActiveGroupQueryData, MyGroupsQueryData } from './groupQueries.ts'
import { groupFields } from './fragments.ts'
import { addGroupToList, reconcileActiveGroup, removeGroupFromList } from './reconciliation.ts'

type MyActiveGroupUpdatedData = { myActiveGroupUpdated: GroupRecord }
type MyGroupsUpdatedData = { myGroupsUpdated: GroupRecord }

const MY_ACTIVE_GROUP_UPDATED: TypedDocumentNode<MyActiveGroupUpdatedData, Record<string, never>> = gql`
	subscription myActiveGroupUpdated {
		myActiveGroupUpdated {
			${groupFields}
		}
	}
`

const MY_GROUPS_UPDATED: TypedDocumentNode<MyGroupsUpdatedData, Record<string, never>> = gql`
	subscription myGroupsUpdated {
		myGroupsUpdated {
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
