import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { CourseRecord } from '../records.ts'
import type { UseUnsubscribeFromCourseResult } from '../types.ts'
import { courseMutationFields, USER_PUBLIC_FRAGMENT } from '../fragments.ts'

type UnsubscribeFromCourseData = { unsubscribeFromCourse: CourseRecord }
type UnsubscribeFromCourseVariables = { courseId: string }

const UNSUBSCRIBE_FROM_COURSE_MUTATION: TypedDocumentNode<UnsubscribeFromCourseData, UnsubscribeFromCourseVariables> = gql`
	mutation unsubscribeFromCourse($courseId: ID!) {
		unsubscribeFromCourse(courseId: $courseId) {
			${courseMutationFields}
		}
	}
	${USER_PUBLIC_FRAGMENT}
`

export function useUnsubscribeFromCourse(): UseUnsubscribeFromCourseResult {
	const [mutate, { loading, error }] = useMutation(UNSUBSCRIBE_FROM_COURSE_MUTATION, {
		update(cache, { data }) {
			const removedCourse = data?.unsubscribeFromCourse
			if (!removedCourse) return
			cache.modify({
				fields: {
					myCourses: (existingReferences = [], { readField }) => existingReferences.filter((reference: Reference | undefined) => readField('id', reference) !== removedCourse.id),
				},
			})
		},
	})
	const unsubscribeFromCourse = useCallback(async (courseId: string) => { await mutate({ variables: { courseId } }) }, [mutate])
	return [unsubscribeFromCourse, { loading, error }]
}
