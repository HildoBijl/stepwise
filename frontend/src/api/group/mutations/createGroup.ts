import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseCreateGroupResult } from '../types.ts'
import type { GroupRecord } from '../records.ts'
import { groupFields } from '../fragments.ts'
import { addGroupToCachedLists } from './cache.ts'

type CreateGroupData = { createGroup: GroupRecord }

const CREATE_GROUP_MUTATION: TypedDocumentNode<CreateGroupData, Record<string, never>> = gql`
	mutation createGroup {
		createGroup {
			${groupFields}
		}
	}
`

export function useCreateGroup(): UseCreateGroupResult {
	const [mutate, { loading, error }] = useMutation(CREATE_GROUP_MUTATION, {
		update(cache, { data }) {
			if (data?.createGroup) addGroupToCachedLists(cache, data.createGroup)
		},
	})
	const createGroup = useCallback(async () => { await mutate() }, [mutate])
	return [createGroup, { loading, error }]
}
