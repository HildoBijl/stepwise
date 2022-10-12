import { useEffect } from 'react'
import { gql } from '@apollo/client'
import { useQuery, useMutation } from '@apollo/client'

// MyGroups returns all the groups the user is a member of.
export function useMyGroupsQuery() {
	return useQuery(MY_GROUPS)
}
const MY_GROUPS = gql`
	{
		myGroups {
			code
			members {
				name
			}
		}
	}
`

// Group returns the data of a group with the given code.
export function useGroupQuery(code) {
	return useQuery(GROUP, { variables: { code } })
}
const GROUP = gql`
	query group($code: String!) {
		group(code: $code) {
			code
			members {
				name
			}
		}
	}
`

// CreateGroup creates a new group and makes the user a member.
export function useCreateGroupMutation() {
	return useMutation(CREATE_GROUP, {
		update: (cache, { data: { createGroup: group } }) => {
			const { myGroups } = cache.readQuery({ query: MY_GROUPS })
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
			code
			members {
				name
			}
		}
	}
`

// JoinGroup will add a user to a group, setting up their membership.
export function useJoinGroupMutation(code) {
	const [joinGroup, res] = useMutation(JOIN_GROUP, {
		variables: { code },
		update: (cache, { data: { joinGroup: group } }) => {
			const { myGroups } = cache.readQuery({ query: MY_GROUPS })
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && (myGroups.find(group => group.code === code) ? myGroups : [...myGroups, group]),
				},
			})
		},
	})
	const joinGroupWithCode = (code) => {
		joinGroup({ variables: { code } })
	}
	return [joinGroupWithCode, res]
}
const JOIN_GROUP = gql`
	mutation joinGroup($code: String!) {
		joinGroup(code: $code) {
			code
			members {
				name
			}
		}
	}
`

// LeaveGroup will remove a user from a group, ending their membership.
export function useLeaveGroupMutation(code) {
	return useMutation(LEAVE_GROUP, {
		variables: { code },
		update: (cache) => {
			const { myGroups } = cache.readQuery({ query: MY_GROUPS })
			cache.writeQuery({
				query: MY_GROUPS,
				data: {
					myGroups: myGroups && myGroups.filter(group => group.code !== code),
				},
			})
		},
	})
}
const LEAVE_GROUP = gql`
	mutation leaveGroup($code: String!) {
		leaveGroup(code: $code)
	}
`

// GroupSubscription subscribes to the group and updates on new data.
export function useGroupSubscription(code, subscribeToMore) {
	useEffect(() => {
		const unsubscribe = subscribeToMore({
			document: GROUP_UPDATED,
			variables: { code },
			updateQuery: (prev, { subscriptionData }) => {
				if (!subscriptionData.data) {
					return prev
				}
				const res = {
					...prev.group,
					...subscriptionData.data.groupUpdated,
				}
				return { group: res }
			}
		})
		return () => unsubscribe()
	}, [code, subscribeToMore])
}
const GROUP_UPDATED = gql`
	subscription groupUpdated($code: String!) {
		groupUpdated(code: $code) {
			code
			members {
				name
			}
		}
	}
`
