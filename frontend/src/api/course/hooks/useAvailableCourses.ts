import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import type { CourseRecord } from '../records.ts'
import type { UseAvailableCoursesResult } from '../types.ts'
import { availableCourseFields } from '../fragments.ts'
import { courseRecordToCourseInfo } from '../conversion.ts'

type AvailableCoursesQueryData = { allCourses: CourseRecord[] }

export function useAvailableCourses(): UseAvailableCoursesResult {
	const { data, loading, error } = useQuery(AVAILABLE_COURSES_QUERY)
	const records = (data as AvailableCoursesQueryData | undefined)?.allCourses
	const courses = useMemo(() => records?.map(courseRecordToCourseInfo), [records])
	return { courses, loading, error }
}

const AVAILABLE_COURSES_QUERY: TypedDocumentNode<AvailableCoursesQueryData, Record<string, never>> = gql`
	query availableCourses {
		allCourses {
			${availableCourseFields}
		}
	}
`
