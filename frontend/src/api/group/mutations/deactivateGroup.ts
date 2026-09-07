import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseDeactivateGroupResult } from '../types.ts'
import type { GroupRecord } from '../records.ts'
import { MY_GROUPS_QUERY } from '../queries/useMyGroups.ts'
import { groupFields } from '../fragments.ts'
import { addGroupToList } from '../reconciliation.ts'
import { writeActiveGroup } from './cache.ts'

type DeactivateGroupData = { deactivateGroup: GroupRecord | null }

const DEACTIVATE_GROUP_MUTATION: TypedDocumentNode<DeactivateGroupData, Record<string, never>> = gql`
	mutation deactivateGroup {
		deactivateGroup {
			${groupFields}
		}
	}
`

export function useDeactivateGroup(): UseDeactivateGroupResult {
	const [mutate, { loading, error }] = useMutation(DEACTIVATE_GROUP_MUTATION, {
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
