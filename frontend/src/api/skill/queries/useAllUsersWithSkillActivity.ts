import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from '../../user/fragments.ts'

import type { UserWithSkillActivityRecord } from '../records.ts'
import type { UseAllUsersWithSkillActivityResult } from '../types.ts'
import { userWithSkillActivityRecordToUser } from '../conversion.ts'

type AllUsersWithSkillActivityQueryData = { allUsers: UserWithSkillActivityRecord[] }

const ALL_USERS_WITH_SKILL_ACTIVITY_QUERY: TypedDocumentNode<AllUsersWithSkillActivityQueryData, Record<string, never>> = gql`
	query allUsersWithSkillActivity {
		allUsers {
			...UserPublicFields
			sharedData {
				...UserSharedDataFields
				skills {
					userId
					skillId
					levelData {
						coefficientsOn
					}
				}
			}
			accountData {
				...UserAccountDataFields
			}
		}
	}
	${USER_FRAGMENTS}
`

export function useAllUsersWithSkillActivity(): UseAllUsersWithSkillActivityResult {
	const { data, loading, error } = useQuery(ALL_USERS_WITH_SKILL_ACTIVITY_QUERY)
	const records = data?.allUsers
	const users = useMemo(() => records?.map(userWithSkillActivityRecordToUser), [records])
	return { users, loading, error }
}
