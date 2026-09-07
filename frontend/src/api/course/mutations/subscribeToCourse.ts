import { useCallback } from 'react'
import { type Reference, type TypedDocumentNode, gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { USER_PUBLIC_FRAGMENT } from '../../user/fragments.ts'

import type { MyCourseRecord } from '../records.ts'
import type { UseSubscribeToCourseResult } from '../types.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'

type SubscribeToCourseData = { subscribeToCourse: MyCourseRecord }
type SubscribeToCourseVariables = { courseId: string }

const SUBSCRIBE_TO_COURSE_MUTATION: TypedDocumentNode<SubscribeToCourseData, SubscribeToCourseVariables> = gql`
	mutation subscribeToCourse($courseId: ID!) {
		subscribeToCourse(courseId: $courseId) {
			...CourseInfoFields
			subscription {
				role
				subscribedAt
			}
			students {
				...UserPublicFields
			}
		}
	}
	${COURSE_INFO_FRAGMENT}
	${USER_PUBLIC_FRAGMENT}
`

export function useSubscribeToCourse(): UseSubscribeToCourseResult {
	const [mutate, { loading, error }] = useMutation(SUBSCRIBE_TO_COURSE_MUTATION, {
		update(cache, { data }) {
			const newCourse = data?.subscribeToCourse
			if (!newCourse) return
			cache.modify({
				fields: {
					myCourses: (existingReferences = [], { readField, toReference }) => {
						if (existingReferences.some((reference: Reference | undefined) => readField('id', reference) === newCourse.id)) return existingReferences
						const newCourseReference = toReference({ __typename: newCourse.__typename, id: newCourse.id })
						if (!newCourseReference) throw new Error('Could not create a cache reference for the subscribed course.')
						return [...existingReferences, newCourseReference]
					},
				},
			})
		},
	})
	const subscribeToCourse = useCallback(async (courseId: string) => { await mutate({ variables: { courseId } }) }, [mutate])
	return [subscribeToCourse, { loading, error }]
}
