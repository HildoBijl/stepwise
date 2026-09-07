import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { USER_PUBLIC_FRAGMENT } from '../../user/fragments.ts'

import type { FullCourseRecord } from '../records.ts'
import type { UsePromoteToTeacherResult } from '../types.ts'

type PromotedCourseRecord = Pick<FullCourseRecord, '__typename' | 'id' | 'teachers' | 'students'>
type PromoteToTeacherData = { promoteToTeacher: PromotedCourseRecord }
type PromoteToTeacherVariables = { courseId: string; userId: string }

const PROMOTE_TO_TEACHER_MUTATION: TypedDocumentNode<PromoteToTeacherData, PromoteToTeacherVariables> = gql`
	mutation promoteToTeacher($courseId: ID!, $userId: ID!) {
		promoteToTeacher(courseId: $courseId, userId: $userId) {
			__typename
			id
			teachers {
				...UserPublicFields
			}
			students {
				...UserPublicFields
			}
		}
	}
	${USER_PUBLIC_FRAGMENT}
`

export function usePromoteToTeacher(courseId: string): UsePromoteToTeacherResult {
	const [mutate, { loading, error }] = useMutation(PROMOTE_TO_TEACHER_MUTATION)
	const promoteToTeacher = useCallback(async (userId: string) => { await mutate({ variables: { courseId, userId } }) }, [courseId, mutate])
	return [promoteToTeacher, { loading, error }]
}
