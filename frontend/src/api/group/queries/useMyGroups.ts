import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { UseMyGroupsResult } from '../types.ts'
import type { GroupRecord } from '../records.ts'
import { groupFields } from '../fragments.ts'
import { groupRecordToGroup } from '../conversion.ts'
import { useMyGroupsSubscription } from '../subscriptions/index.ts'

export type MyGroupsQueryData = { myGroups: GroupRecord[] }

export const MY_GROUPS_QUERY: TypedDocumentNode<MyGroupsQueryData, Record<string, never>> = gql`
	query myGroups {
		myGroups {
			${groupFields}
		}
	}
`

export function useMyGroups(): UseMyGroupsResult {
	const { data, loading, error, subscribeToMore } = useQuery(MY_GROUPS_QUERY)
	useMyGroupsSubscription(subscribeToMore)
	const records = data?.myGroups
	const groups = useMemo(() => records?.map(groupRecordToGroup), [records])
	return { groups, loading, error }
}
