import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseJoinGroupResult } from '../types.ts'
import type { GroupRecord } from '../records.ts'
import { groupFields } from '../fragments.ts'
import { addGroupToCachedLists } from './cache.ts'

type JoinGroupData = { joinGroup: GroupRecord }
type JoinGroupVariables = { code: string }

const JOIN_GROUP_MUTATION: TypedDocumentNode<JoinGroupData, JoinGroupVariables> = gql`
	mutation joinGroup($code: String!) {
		joinGroup(code: $code) {
			${groupFields}
		}
	}
`

export function useJoinGroup(): UseJoinGroupResult {
	const [mutate, { loading, error }] = useMutation(JOIN_GROUP_MUTATION, {
		update(cache, { data }) {
			if (data?.joinGroup) addGroupToCachedLists(cache, data.joinGroup)
		},
	})
	const joinGroup = useCallback(async (code: string) => { await mutate({ variables: { code: code.toUpperCase() } }) }, [mutate])
	return [joinGroup, { loading, error }]
}
