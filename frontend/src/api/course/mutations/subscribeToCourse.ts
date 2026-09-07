import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import type { UseSubscribeToCourseResult } from '../types.ts'
import type { CourseRecordWithSubscription } from '../records.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'

type SubscribeToCourseData = { subscribeToCourse: CourseRecordWithSubscription }
type SubscribeToCourseVariables = { courseId: string }

const SUBSCRIBE_TO_COURSE_MUTATION: TypedDocumentNode<SubscribeToCourseData, SubscribeToCourseVariables> = gql`
	mutation subscribeToCourse($courseId: ID!) {
		subscribeToCourse(courseId: $courseId) {
			...CourseInfoFields
			subscription {
				role
				subscribedAt
			}
		}
	}
	${COURSE_INFO_FRAGMENT}
`

export function useSubscribeToCourse(): UseSubscribeToCourseResult {
	const [mutate, { loading, error }] = useMutation(SUBSCRIBE_TO_COURSE_MUTATION, {
		update(cache, { data }) {
			const newCourse = data?.subscribeToCourse
			if (!newCourse) return
			cache.modify({
				fields: {
					myCourses: (existingReferences = [], { readField }) => {
						if (existingReferences.some((reference: Reference | undefined) => readField('id', reference) === newCourse.id)) return existingReferences
						const newCourseReference = cache.writeFragment({
							data: newCourse,
							fragment: gql`
								fragment NewCourse on Course {
									id
									__typename
								}
							`,
						})
						return [...existingReferences, newCourseReference]
					},
				},
			})
		},
	})
	const subscribeToCourse = useCallback(async (courseId: string) => { await mutate({ variables: { courseId } }) }, [mutate])
	return [subscribeToCourse, { loading, error }]
}
