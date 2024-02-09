import { useEffect } from 'react'
import { gql } from '@apollo/client'

import { useUserId } from '../user'

import { groupParameters } from './util'

// GroupSubscription subscribes to the given group and updates on new data.
export function useGroupSubscription(code, subscribeToMore) {
	const userId = useUserId()
	useEffect(() => {
		const unsubscribe = subscribeToMore({
			document: GROUP_UPDATED,
			variables: { code },
			updateQuery: (prev, { subscriptionData }) => {
				const updatedGroup = subscriptionData?.data?.groupUpdate
				if (!updatedGroup)
					return prev

				// If the user is not a member anymore, remove this group.
				if (!updatedGroup.members.some(member => member.userId === userId))
					return { group: null }

				// Update the group with its new data.
				return { group: { ...prev.group, ...updatedGroup } }
			}
		})
		return () => unsubscribe()
	}, [userId, code, subscribeToMore])
}
const GROUP_UPDATED = gql`
	subscription groupUpdate($code: String!) {
		groupUpdate(code: $code) {
			${groupParameters}
		}
	}
`

// MyActiveGroupSubscription subscribes to all updates on the MyActiveGroup query.
export function useMyActiveGroupSubscription(subscribeToMore, apply = true) {
	const userId = useUserId()
	useEffect(() => {
		if (!apply)
			return
		const unsubscribe = subscribeToMore({
			document: MY_ACTIVE_GROUP_UPDATED,
			updateQuery: ({ myActiveGroup }, { subscriptionData }) => {
				const updatedGroup = subscriptionData?.data?.myActiveGroupUpdate
				if (!updatedGroup)
					return { myActiveGroup }

				// If the updated group has the user as active, apply it.
				const member = updatedGroup.members && updatedGroup.members.find(member => member.userId === userId)
				if (member && member.active)
					return { myActiveGroup: updatedGroup }

				// The user is not an active member. Check if the previous group has him active. In that case, it may happen that the activation of a new group came faster than the deactivation of the previous group.
				const currentMember = myActiveGroup && myActiveGroup.members && myActiveGroup.members.find(member => member.userId === userId)
				if (currentMember && currentMember.active)
					return { myActiveGroup }

				// No idea in which group the user is active.
				return { myActiveGroup: null }
			}
		})
		return () => unsubscribe()
	}, [apply, userId, subscribeToMore])
}
const MY_ACTIVE_GROUP_UPDATED = gql`
	subscription myActiveGroupUpdate {
		myActiveGroupUpdate {
			${groupParameters}
		}
	}
`

// MyGroupsSubscription subscribes to all the user's groups and updates on new data.
export function useMyGroupsSubscription(subscribeToMore) {
	const userId = useUserId()
	useEffect(() => {
		const unsubscribe = subscribeToMore({
			document: MY_GROUPS_UPDATED,
			updateQuery: ({ myGroups }, { subscriptionData }) => {
				const updatedGroup = subscriptionData?.data?.myGroupsUpdate
				if (!updatedGroup)
					return { myGroups }

				// If the group exists, replace it. Otherwise add it.
				if (myGroups.some(group => group.code === updatedGroup.code))
					myGroups = myGroups.map(group => group.code === updatedGroup.code ? updatedGroup : group)
				else
					myGroups = [...myGroups, updatedGroup]

				// If the group does not have the user in it, filter it out.
				if (!updatedGroup.members.some(member => member.userId === userId))
					myGroups = myGroups.filter(group => group.code !== updatedGroup.code)

				return { myGroups }
			}
		})
		return () => unsubscribe()
	}, [userId, subscribeToMore])
}
const MY_GROUPS_UPDATED = gql`
	subscription myGroupsUpdate {
		myGroupsUpdate {
			${groupParameters}
		}
	}
`
