import { useEffect } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client'

// This is the data that will be loaded on groups.
const groupParameters = `
	code
	active
	members {
		id
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
		update: (cache, { data: { createGroup: group } }) => {
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && [...myGroups, group],
				},
			})
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
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && (myGroups.find(group => group.code === updatedGroup.code) ?
						myGroups.map(group => group.code === updatedGroup.code ? updatedGroup : group) :
						[...myGroups, updatedGroup]),
				},
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
	code = code.toUpperCase()
	return useMutation(LEAVE_GROUP, {
		variables: { code },
		update: (cache) => {
			// Update MyGroups.
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			console.log(myGroups)
			if (myGroups) {
				console.log('Replacing')
				cache.writeQuery({
					query: MY_GROUPS,
					data: {
						myGroups: myGroups && myGroups.filter(group => group.code !== code),
					},
				})
			}

			// Update Group.
			const group = cache.readQuery({ query: GROUP, variables: { code } })?.group
			if (group) {
				console.log('Writing group')
				cache.writeQuery({
					query: GROUP,
					variables: { code },
					data: {
						group: {
							...group,
							active: false,
							members: [],
						},
					},
				})
			}
			console.log(group)
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
		update: (cache, { data: { joinGroup: updatedGroup } }) => {
			console.log('UPDATING???')
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && (myGroups.find(group => group.code === code) ?
						myGroups.map(group => group.code === code ? updatedGroup : group) :
						[...myGroups, updatedGroup]),
				},
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
		update: (cache, { data: { joinGroup: updatedGroup } }) => {
			const myGroups = cache.readQuery({ query: MY_GROUPS })?.myGroups
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && (myGroups.find(group => group.code === code) ?
						myGroups.map(group => group.code === code ? updatedGroup : group) :
						[...myGroups, updatedGroup]),
				},
			})
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

// GroupSubscription subscribes to the group and updates on new data.
export function useGroupSubscription(code, subscribeToMore) {
	useEffect(() => {
		const unsubscribe = subscribeToMore({
			document: GROUP_UPDATED,
			variables: { code },
			updateQuery: (prev, { subscriptionData }) => {
				if (!subscriptionData.data)
					return prev
				return {
					group: {
						...prev.group,
						...subscriptionData.data.groupUpdated,
					}
				}
			}
		})
		return () => unsubscribe()
	}, [code, subscribeToMore])
}
const GROUP_UPDATED = gql`
	subscription groupUpdated($code: String!) {
		groupUpdated(code: $code) {
			${groupParameters}
		}
	}
`
