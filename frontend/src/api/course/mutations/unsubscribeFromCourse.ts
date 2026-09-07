import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseUnsubscribeFromCourseResult } from '../types.ts'
import type { CourseRecord } from '../records.ts'

type UnsubscribedCourseRecord = Pick<CourseRecord, '__typename' | 'id' | 'subscription'>
type UnsubscribeFromCourseData = { unsubscribeFromCourse: UnsubscribedCourseRecord }
type UnsubscribeFromCourseVariables = { courseId: string }

const UNSUBSCRIBE_FROM_COURSE_MUTATION: TypedDocumentNode<UnsubscribeFromCourseData, UnsubscribeFromCourseVariables> = gql`
	mutation unsubscribeFromCourse($courseId: ID!) {
		unsubscribeFromCourse(courseId: $courseId) {
			__typename
			id
			subscription {
				role
				subscribedAt
			}
		}
	}
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
