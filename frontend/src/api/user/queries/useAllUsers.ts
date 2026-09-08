import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { UserWithAccountDataRecord } from '../records.ts'
import type { UseAllUsersResult } from '../types.ts'
import { USER_FRAGMENTS } from '../fragments.ts'
import { userWithAccountDataRecordToUser } from '../conversion.ts'

type AllUsersQueryData = { allUsers: UserWithAccountDataRecord[] }

const ALL_USERS_QUERY: TypedDocumentNode<AllUsersQueryData, Record<string, never>> = gql`
	query allUsers {
		allUsers {
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

export function useAllUsers(): UseAllUsersResult {
	const { data, loading, error } = useQuery(ALL_USERS_QUERY)
	const records = data?.allUsers
	const users = useMemo(() => records?.map(userWithAccountDataRecordToUser), [records])
	return { users, loading, error }
}
