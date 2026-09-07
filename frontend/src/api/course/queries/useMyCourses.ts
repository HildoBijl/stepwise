import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_PUBLIC_FRAGMENT } from '../../user/fragments.ts'

import type { MyCourseRecord } from '../records.ts'
import type { UseMyCoursesResult } from '../types.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'
import { courseRecordsToMyCourses } from '../conversion.ts'

type MyCoursesQueryData = { myCourses: MyCourseRecord[] }

const MY_COURSES_QUERY: TypedDocumentNode<MyCoursesQueryData, Record<string, never>> = gql`
	query myCourses {
		myCourses {
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

export function useMyCourses(): UseMyCoursesResult {
	const { data, loading, error } = useQuery(MY_COURSES_QUERY)
	const records = data?.myCourses
	const courses = useMemo(() => records ? courseRecordsToMyCourses(records) : { studentCourses: undefined, teacherCourses: undefined }, [records])
	return { ...courses, loading, error }
}
