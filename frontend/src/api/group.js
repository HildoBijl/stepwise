import { useEffect } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client'

import { useUserId } from 'api/user'
import { group } from 'd3'

// This is the data that will be loaded on groups.
const groupParameters = `
	code
	members {
		groupId
		userId
		name
		givenName
		familyName
		active
	}
`

// MyGroups returns all the groups the user is a member of.
export function useMyGroupsQuery() {
	return useQuery(MY_GROUPS)
}
const MY_GROUPS = gql`
	{
		myGroups {
			${groupParameters}
		}
	}
`

// Group returns the data of a group with the given code.
export function useGroupQuery(code) {
	code = code.toUpperCase()
	return useQuery(GROUP, { variables: { code } })
}
const GROUP = gql`
	query group($code: String!) {
		group(code: $code) {
			${groupParameters}
		}
	}
`

// CreateGroup creates a new group and makes the user a member.
export function useCreateGroupMutation() {
	return useMutation(CREATE_GROUP, {
		update: (cache, { data: { createGroup: newGroup } }) => {
			// Update MyGroups. (No need to update Group, since no one follows it yet.)
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			if (myGroups) {
				cache.writeQuery({
					query: MY_GROUPS,
					data: { myGroups: addGroupToList(newGroup, myGroups) },
				})
			}
		},
	})
}
const CREATE_GROUP = gql`
	mutation createGroup {
		createGroup {
			${groupParameters}
		}
	}
`

// JoinGroup will add a user to a group, setting up their membership.
export function useJoinGroupMutation() {
	const [joinGroup, res] = useMutation(JOIN_GROUP, {
		update: (cache, { data: { joinGroup: updatedGroup } }) => {
			// Update MyGroups.
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			if (myGroups) {
				cache.writeQuery({
					query: MY_GROUPS,
					data: { myGroups: addGroupToList(updatedGroup, myGroups) },
				})
			}

			// Update Group.
			cache.writeQuery({
				query: GROUP,
				variables: { code: group.code },
				data: { group: updatedGroup },
			})
		},
	})
	const joinGroupWithCode = (code) => {
		code = code.toUpperCase()
		joinGroup({ variables: { code } })
	}
	return [joinGroupWithCode, res]
}
const JOIN_GROUP = gql`
	mutation joinGroup($code: String!) {
		joinGroup(code: $code) {
			${groupParameters}
		}
	}
`

// LeaveGroup will remove a user from a group, ending their membership.
export function useLeaveGroupMutation(code) {
	const userId = useUserId()
	code = code.toUpperCase()
	return useMutation(LEAVE_GROUP, {
		variables: { code },
		update: (cache) => {
			// Update MyGroups.
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			if (myGroups && myGroups.some(group => group.code === code)) {
				cache.writeQuery({
					query: MY_GROUPS,
					data: { myGroups: removeGroupFromList(code, myGroups) },
				})
			}

			// Update Group.
			const group = cache.readQuery({ query: GROUP, variables: { code } })?.group
			if (group) {
				cache.writeQuery({
					query: GROUP,
					variables: { code },
					data: {
						group: {
							...group,
							members: group.members.filter(member => member.userId !== userId),
						},
					},
				})
			}
		},
	})
}
const LEAVE_GROUP = gql`
	mutation leaveGroup($code: String!) {
		leaveGroup(code: $code)
	}
`

// ActivateGroup will make a user active within the current group.
export function useActivateGroupMutation(code) {
	code = code.toUpperCase()
	return useMutation(ACTIVATE_GROUP, {
		variables: { code },
		update: (cache, { data: { activateGroup: updatedGroup } }) => {
			// Update MyGroups.
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			if (myGroups) {
				cache.writeQuery({
					query: MY_GROUPS,
					data: { myGroups: addGroupToList(updatedGroup, myGroups) },
				})
			}

			// Update Group.
			cache.writeQuery({
				query: GROUP,
				variables: { code: group.code },
				data: { group: updatedGroup },
			})
		},
	})
}
const ACTIVATE_GROUP = gql`
	mutation activateGroup($code: String!) {
		activateGroup(code: $code) {
			${groupParameters}
		}
	}
`

// DeactivateGroup will make a user active within the current group.
export function useDeactivateGroupMutation(code) {
	code = code.toUpperCase()
	return useMutation(DEACTIVATE_GROUP, {
		variables: { code },
		update: (cache, { data: { deactivateGroup: updatedGroup } }) => {
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			if (myGroups) {
				cache.writeQuery({
					query: MY_GROUPS,
					data: { myGroups: addGroupToList(updatedGroup, myGroups) },
				})
			}
		},
	})
}
const DEACTIVATE_GROUP = gql`
	mutation deactivateGroup($code: String!) {
		deactivateGroup(code: $code) {
			${groupParameters}
		}
	}
`

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
	}, [code, subscribeToMore])
}
const GROUP_UPDATED = gql`
	subscription groupUpdate($code: String!) {
		groupUpdate(code: $code) {
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

function addGroupToList(newGroup, groups = []) {
	if (groups.some(group => group.code === newGroup.code))
		return groups.map(group => group.code === newGroup.code ? newGroup : group)
	return [...groups, newGroup]
}

function removeGroupFromList(code, groups = []) {
	const result = groups.filter(group => group.code !== code)
	return result.length === groups.length ? groups : result
}
