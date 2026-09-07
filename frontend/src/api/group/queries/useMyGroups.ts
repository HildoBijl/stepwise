import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { useUserId } from '../../user/index.ts'

import type { MyGroupsQueryData } from '../records.ts'
import type { UseMyGroupsResult } from '../types.ts'
import { groupFields } from '../fragments.ts'
import { groupRecordToGroup } from '../conversion.ts'
import { useMyGroupsSubscription } from '../subscriptions/index.ts'

export const MY_GROUPS_QUERY: TypedDocumentNode<MyGroupsQueryData, Record<string, never>> = gql`
	query myGroups {
		myGroups {
			${groupFields}
		}
	}
`

export function useMyGroups(): UseMyGroupsResult {
	const userId = useUserId()
	const { data, loading, error, subscribeToMore } = useQuery(MY_GROUPS_QUERY, { skip: !userId })
	useMyGroupsSubscription(subscribeToMore, !!userId)
	const records = userId ? data?.myGroups : undefined
	const groups = useMemo(() => records?.map(groupRecordToGroup), [records])
	return { groups, loading, error }
}
