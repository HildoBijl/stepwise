import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'

import { useUserId } from 'api/user'

import { groupParameters, addGroupToList, removeGroupFromList } from './util'
import { GROUP, MY_GROUPS } from './queries'

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
				variables: { code: updatedGroup.code },
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
				variables: { code: updatedGroup.code },
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
