import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { GroupRecord } from '../records.ts'
import type { UseActivateGroupResult } from '../types.ts'
import { groupFields } from '../fragments.ts'

import { addGroupToCachedLists } from './cache.ts'

type ActivateGroupData = { activateGroup: GroupRecord }
type ActivateGroupVariables = { code: string }

const ACTIVATE_GROUP_MUTATION: TypedDocumentNode<ActivateGroupData, ActivateGroupVariables> = gql`
	mutation activateGroup($code: String!) {
		activateGroup(code: $code) {
			${groupFields}
		}
	}
`

export function useActivateGroup(code: string | undefined): UseActivateGroupResult {
	const [mutate, { loading, error }] = useMutation(ACTIVATE_GROUP_MUTATION, {
		update(cache, { data }) {
			if (data?.activateGroup) addGroupToCachedLists(cache, data.activateGroup)
		},
	})
	const activateGroup = useCallback(async () => {
		if (!code) throw new Error('Cannot activate a group without a group code.')
		await mutate({ variables: { code: code.toUpperCase() } })
	}, [code, mutate])
	return [activateGroup, { loading, error }]
}
