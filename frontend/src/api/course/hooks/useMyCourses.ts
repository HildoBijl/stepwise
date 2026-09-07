import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { CourseRecord } from '../records.ts'
import type { SubscribedCourseInfo, UseMyCoursesResult } from '../types.ts'
import { myCourseFields, USER_PUBLIC_FRAGMENT } from '../fragments.ts'
import { courseRecordToCourseInfo } from '../conversion.ts'

type MyCoursesQueryData = { myCourses: CourseRecord[] }

export function useMyCourses(): UseMyCoursesResult {
	const { data, loading, error } = useQuery(MY_COURSES_QUERY)
	const records = (data as MyCoursesQueryData | undefined)?.myCourses
	const courses = useMemo(() => records?.map(record => {
		const course = courseRecordToCourseInfo(record)
		if (!course.subscription) throw new Error('Invalid own course: the current user does not have a subscription.')
		return { ...course, subscription: course.subscription } satisfies SubscribedCourseInfo
	}), [records])
	return { courses, loading, error }
}

export const MY_COURSES_QUERY: TypedDocumentNode<MyCoursesQueryData, Record<string, never>> = gql`
	query myCourses {
		myCourses {
			${myCourseFields}
		}
	}
	${USER_PUBLIC_FRAGMENT}
`
