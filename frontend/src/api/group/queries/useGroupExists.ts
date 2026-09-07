import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { UseGroupExistsResult } from '../types.ts'

type GroupExistsQueryData = { groupExists: boolean }
type GroupExistsQueryVariables = { code: string }

const GROUP_EXISTS_QUERY: TypedDocumentNode<GroupExistsQueryData, GroupExistsQueryVariables> = gql`
	query groupExists($code: String!) {
		groupExists(code: $code)
	}
`

export function useGroupExists(code: string, apply = true): UseGroupExistsResult {
	const { data, loading, error } = useQuery(GROUP_EXISTS_QUERY, { variables: { code: code.toUpperCase() }, skip: !apply })
	return { exists: data?.groupExists, loading, error }
}
