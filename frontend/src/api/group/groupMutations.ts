import { useCallback } from 'react'
import { type ApolloCache, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseActivateGroupResult, UseCreateGroupResult, UseDeactivateGroupResult, UseJoinGroupResult, UseLeaveGroupResult } from './types.ts'
import type { GroupRecord } from './records.ts'
import { groupFields } from './fragments.ts'
import { MY_ACTIVE_GROUP_QUERY, MY_GROUPS_QUERY } from './groupQueries.ts'
import { addGroupToList, removeGroupFromList } from './reconciliation.ts'

type GroupMutationData<Key extends string> = Record<Key, GroupRecord>
type GroupCodeVariables = { code: string }
type LeaveGroupData = { leaveGroup: boolean }
type DeactivateGroupData = { deactivateGroup: GroupRecord | null }

const CREATE_GROUP: TypedDocumentNode<GroupMutationData<'createGroup'>, Record<string, never>> = gql`
	mutation createGroup {
		createGroup {
			${groupFields}
		}
	}
`

const JOIN_GROUP: TypedDocumentNode<GroupMutationData<'joinGroup'>, GroupCodeVariables> = gql`
	mutation joinGroup($code: String!) {
		joinGroup(code: $code) {
			${groupFields}
		}
	}
`

const LEAVE_GROUP: TypedDocumentNode<LeaveGroupData, GroupCodeVariables> = gql`
	mutation leaveGroup($code: String!) {
		leaveGroup(code: $code)
	}
`

const ACTIVATE_GROUP: TypedDocumentNode<GroupMutationData<'activateGroup'>, GroupCodeVariables> = gql`
	mutation activateGroup($code: String!) {
		activateGroup(code: $code) {
			${groupFields}
		}
	}
`

const DEACTIVATE_GROUP: TypedDocumentNode<DeactivateGroupData, Record<string, never>> = gql`
	mutation deactivateGroup {
		deactivateGroup {
			${groupFields}
		}
	}
`

function writeActiveGroup(cache: ApolloCache, group: GroupRecord | null): void {
	cache.writeQuery({ query: MY_ACTIVE_GROUP_QUERY, data: { myActiveGroup: group } })
}

function addGroupToCachedLists(cache: ApolloCache, group: GroupRecord): void {
	writeActiveGroup(cache, group)
	const groups = cache.readQuery({ query: MY_GROUPS_QUERY })?.myGroups
	if (groups) cache.writeQuery({ query: MY_GROUPS_QUERY, data: { myGroups: addGroupToList(group, groups) } })
}

export function useCreateGroup(): UseCreateGroupResult {
	const [mutate, { loading, error }] = useMutation(CREATE_GROUP, {
		update(cache, { data }) {
			if (data?.createGroup) addGroupToCachedLists(cache, data.createGroup)
		},
	})
	const createGroup = useCallback(async () => { await mutate() }, [mutate])
	return [createGroup, { loading, error }]
}

export function useJoinGroup(): UseJoinGroupResult {
	const [mutate, { loading, error }] = useMutation(JOIN_GROUP, {
		update(cache, { data }) {
			if (data?.joinGroup) addGroupToCachedLists(cache, data.joinGroup)
		},
	})
	const joinGroup = useCallback(async (code: string) => { await mutate({ variables: { code: code.toUpperCase() } }) }, [mutate])
	return [joinGroup, { loading, error }]
}

export function useLeaveGroup(code: string): UseLeaveGroupResult {
	const normalizedCode = code.toUpperCase()
	const [mutate, { loading, error }] = useMutation(LEAVE_GROUP, {
		variables: { code: normalizedCode },
		update(cache) {
			const activeGroup = cache.readQuery({ query: MY_ACTIVE_GROUP_QUERY })?.myActiveGroup
			if (activeGroup?.code === normalizedCode) writeActiveGroup(cache, null)
			const groups = cache.readQuery({ query: MY_GROUPS_QUERY })?.myGroups
			if (groups) cache.writeQuery({ query: MY_GROUPS_QUERY, data: { myGroups: removeGroupFromList(normalizedCode, groups) } })
		},
	})
	const leaveGroup = useCallback(async () => { await mutate() }, [mutate])
	return [leaveGroup, { loading, error }]
}

export function useActivateGroup(code: string | undefined): UseActivateGroupResult {
	const [mutate, { loading, error }] = useMutation(ACTIVATE_GROUP)
	const activateGroup = useCallback(async () => {
		if (!code) throw new Error('Cannot activate a group without a group code.')
		await mutate({ variables: { code: code.toUpperCase() } })
	}, [code, mutate])
	return [activateGroup, { loading, error }]
}

export function useDeactivateGroup(): UseDeactivateGroupResult {
	const [mutate, { loading, error }] = useMutation(DEACTIVATE_GROUP, {
		update(cache, { data }) {
			if (!data) return
			writeActiveGroup(cache, null)
			if (!data.deactivateGroup) return
			const groups = cache.readQuery({ query: MY_GROUPS_QUERY })?.myGroups
			if (groups) cache.writeQuery({ query: MY_GROUPS_QUERY, data: { myGroups: addGroupToList(data.deactivateGroup, groups) } })
		},
	})
	const deactivateGroup = useCallback(async () => { await mutate() }, [mutate])
	return [deactivateGroup, { loading, error }]
}
