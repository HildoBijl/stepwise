import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { UserWithAccountDataRecord } from '../records.ts'
import type { UseCurrentUserResult } from '../types.ts'
import { USER_FRAGMENTS } from '../fragments.ts'
import { userWithAccountDataRecordToUser } from '../conversion.ts'

type CurrentUserQueryData = {
	me: UserWithAccountDataRecord | null
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

export function useCurrentUserQuery(): UseCurrentUserResult {
	const { data, loading, error } = useQuery(CURRENT_USER_QUERY)
	const record = data?.me
	const user = useMemo(() => record ? userWithAccountDataRecordToUser(record) : undefined, [record])
	return { user, loading, error }
}
