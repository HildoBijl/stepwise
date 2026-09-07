import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { useUserId } from '../../user/index.ts'

import type { MyActiveGroupQueryData } from '../records.ts'
import type { UseMyActiveGroupResult } from '../types.ts'
import { groupFields } from '../fragments.ts'
import { groupRecordToGroup } from '../conversion.ts'
import { useMyActiveGroupSubscription } from '../subscriptions/index.ts'

export const MY_ACTIVE_GROUP_QUERY: TypedDocumentNode<MyActiveGroupQueryData, Record<string, never>> = gql`
	query myActiveGroup {
		myActiveGroup {
			${groupFields}
		}
	}
`

export function useMyActiveGroup(): UseMyActiveGroupResult {
	const userId = useUserId()
	const { data, loading, error, subscribeToMore } = useQuery(MY_ACTIVE_GROUP_QUERY, { skip: !userId })
	useMyActiveGroupSubscription(subscribeToMore, !!userId)

	const record = data?.myActiveGroup
	const currentMember = record?.members.find(member => member.userId === userId)
	const group = useMemo(() => currentMember?.active && record ? groupRecordToGroup(record) : undefined, [currentMember?.active, record])
	return { group, loading, error }
}
