import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { CurrentUserRecord } from './records.ts'
import { USER_FRAGMENTS } from './fragments.ts'

type CurrentUserQueryData = {
	me: CurrentUserRecord | null
}

export const CURRENT_USER_QUERY: TypedDocumentNode<CurrentUserQueryData, Record<string, never>> = gql`
	query currentUser {
		me {
			...UserPublicFields
			sharedData {
				...UserSharedDataFields
			}
			accountData {
				...UserAccountDataFields
			}
		}
	}
	${USER_FRAGMENTS}
`

export function useCurrentUserQuery() {
	return useQuery(CURRENT_USER_QUERY)
}
