import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from '../user/fragments'

import type { UserWithSkillsRecord } from './records.ts'
import type { UseUserWithSkillsResult } from './types.ts'
import { userWithSkillsRecordToUser } from './conversion'
import { userWithSkillsFields } from './fragments.ts'

type UserWithSkillsQueryData = { user: UserWithSkillsRecord | null }
type UserWithSkillsQueryVariables = { userId: string }

export function useUserWithSkills(userId?: string): UseUserWithSkillsResult {
	const { data, loading, error } = useQuery(USER_WITH_SKILLS, {
		variables: { userId: userId ?? '' },
		skip: !userId,
	})
	const record = (data as UserWithSkillsQueryData | undefined)?.user
	const user = useMemo(() => record ? userWithSkillsRecordToUser(record) : undefined, [record])
	return { user, loading, error }
}

export const USER_WITH_SKILLS: TypedDocumentNode<UserWithSkillsQueryData, UserWithSkillsQueryVariables> = gql`
	query userWithSkills($userId: ID!) {
		user(userId: $userId) {
			${userWithSkillsFields(true)}
		}
	}
	${USER_FRAGMENTS}
`
