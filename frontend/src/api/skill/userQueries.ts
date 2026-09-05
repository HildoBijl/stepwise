import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_FRAGMENTS } from '../user/fragments'

import type { UserWithSkillsRecord } from './records.ts'
import type { UserWithSkills } from './types.ts'
import { userWithSkillsRecordToUser } from './conversion'
import { userWithSkillsFields } from './fragments.ts'

type UserWithSkillsQueryData = { user: UserWithSkillsRecord | null }
type UserWithSkillsQueryVariables = { userId: string }

export function useUserWithSkillsQuery(userId: string) {
	const result = useQuery(USER_WITH_SKILLS, { variables: { userId } })
	const rawData = result.data as UserWithSkillsQueryData | undefined
	const data = useMemo(() => rawData ? { user: rawData.user ? userWithSkillsRecordToUser(rawData.user) : null } : undefined, [rawData])
	return { ...result, data: data as { user: UserWithSkills | null } | undefined }
}

export const USER_WITH_SKILLS: TypedDocumentNode<UserWithSkillsQueryData, UserWithSkillsQueryVariables> = gql`
	query userWithSkills($userId: ID!) {
		user(userId: $userId) {
			${userWithSkillsFields(true)}
		}
	}
	${USER_FRAGMENTS}
`
