import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseLeaveGroupResult } from '../types.ts'
import { removeGroupRecordFromList } from '../recordLists.ts'
import { MY_ACTIVE_GROUP_QUERY } from '../queries/useMyActiveGroup.ts'
import { MY_GROUPS_QUERY } from '../queries/useMyGroups.ts'

import { writeActiveGroup } from './cache.ts'

type LeaveGroupData = { leaveGroup: boolean }
type LeaveGroupVariables = { code: string }

const LEAVE_GROUP_MUTATION: TypedDocumentNode<LeaveGroupData, LeaveGroupVariables> = gql`
	mutation leaveGroup($code: String!) {
		leaveGroup(code: $code)
	}
`

export function useLeaveGroup(code: string): UseLeaveGroupResult {
	const normalizedCode = code.toUpperCase()
	const [mutate, { loading, error }] = useMutation(LEAVE_GROUP_MUTATION, {
		variables: { code: normalizedCode },
		update(cache, { data }) {
			if (!data?.leaveGroup) return
			const activeGroup = cache.readQuery({ query: MY_ACTIVE_GROUP_QUERY })?.myActiveGroup
			if (activeGroup?.code === normalizedCode) writeActiveGroup(cache, null)
			const groups = cache.readQuery({ query: MY_GROUPS_QUERY })?.myGroups
			if (groups) cache.writeQuery({ query: MY_GROUPS_QUERY, data: { myGroups: removeGroupRecordFromList(normalizedCode, groups) } })
		},
	})
	const leaveGroup = useCallback(async () => { await mutate() }, [mutate])
	return [leaveGroup, { loading, error }]
}
