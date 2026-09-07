import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { UseGroupExistsResult, UseMyGroupsResult } from './types.ts'
import type { GroupRecord } from './records.ts'
import { groupFields } from './fragments.ts'
import { groupRecordToGroup } from './conversion.ts'
import { useMyGroupsSubscription } from './groupSubscriptions.ts'

type GroupExistsQueryData = { groupExists: boolean }
type GroupExistsQueryVariables = { code: string }
export type MyActiveGroupQueryData = { myActiveGroup: GroupRecord | null }
export type MyGroupsQueryData = { myGroups: GroupRecord[] }

export const MY_ACTIVE_GROUP_QUERY: TypedDocumentNode<MyActiveGroupQueryData, Record<string, never>> = gql`
	query myActiveGroup {
		myActiveGroup {
			${groupFields}
		}
	}
`

export const MY_GROUPS_QUERY: TypedDocumentNode<MyGroupsQueryData, Record<string, never>> = gql`
	query myGroups {
		myGroups {
			${groupFields}
		}
	}
`

const GROUP_EXISTS_QUERY: TypedDocumentNode<GroupExistsQueryData, GroupExistsQueryVariables> = gql`
	query groupExists($code: String!) {
		groupExists(code: $code)
	}
`

export function useGroupExists(code: string, apply = true): UseGroupExistsResult {
	const { data, loading, error } = useQuery(GROUP_EXISTS_QUERY, { variables: { code: code.toUpperCase() }, skip: !apply })
	return { exists: data?.groupExists, loading, error }
}

export function useMyGroups(): UseMyGroupsResult {
	const { data, loading, error, subscribeToMore } = useQuery(MY_GROUPS_QUERY)
	useMyGroupsSubscription(subscribeToMore)
	const records = data?.myGroups
	const groups = useMemo(() => records?.map(groupRecordToGroup), [records])
	return { groups, loading, error }
}
