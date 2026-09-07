import { useCallback } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { CourseRecord } from '../records.ts'
import type { UsePromoteToTeacherResult } from '../types.ts'
import { courseMutationFields, USER_PUBLIC_FRAGMENT } from '../fragments.ts'

type PromoteToTeacherData = { promoteToTeacher: CourseRecord }
type PromoteToTeacherVariables = { courseId: string; userId: string }

const PROMOTE_TO_TEACHER_MUTATION: TypedDocumentNode<PromoteToTeacherData, PromoteToTeacherVariables> = gql`
	mutation promoteToTeacher($courseId: ID!, $userId: ID!) {
		promoteToTeacher(courseId: $courseId, userId: $userId) {
			${courseMutationFields}
		}
	}
	${USER_PUBLIC_FRAGMENT}
`

export function usePromoteToTeacher(courseId: string): UsePromoteToTeacherResult {
	const [mutate, { loading, error }] = useMutation(PROMOTE_TO_TEACHER_MUTATION)
	const promoteToTeacher = useCallback(async (userId: string) => { await mutate({ variables: { courseId, userId } }) }, [courseId, mutate])
	return [promoteToTeacher, { loading, error }]
}
