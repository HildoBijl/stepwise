import { useMemo } from 'react'
import { type TypedDocumentNode, gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { USER_PUBLIC_FRAGMENT } from '../../user/fragments.ts'

import type { StudentCourseInfo, TeacherCourseInfo, UseMyCoursesResult } from '../types.ts'
import type { CourseRecord } from '../records.ts'
import { COURSE_INFO_FRAGMENT } from '../fragments.ts'
import { courseRecordToCourseInfo } from '../conversion.ts'

type MyCoursesQueryData = { myCourses: CourseRecord[] }

export function useMyCourses(): UseMyCoursesResult {
	const { data, loading, error } = useQuery(MY_COURSES_QUERY)
	const records = (data as MyCoursesQueryData | undefined)?.myCourses
	const courses = useMemo(() => {
		if (!records) return { studentCourses: undefined, teacherCourses: undefined }
		const studentCourses: StudentCourseInfo[] = []
		const teacherCourses: TeacherCourseInfo[] = []
		records.forEach(record => {
			const course = courseRecordToCourseInfo(record)
			if (!course.subscription) throw new Error('Invalid own course: the current user does not have a subscription.')
			if (course.subscription.role === 'student') {
				const { students, ...courseWithoutStudents } = course
				if (students !== undefined) throw new Error('Invalid student course: student data is visible to a student.')
				studentCourses.push({ ...courseWithoutStudents, subscription: { ...course.subscription, role: 'student' } })
				return
			}
			if (course.subscription.role !== 'teacher') throw new Error(`Invalid own course: unknown subscription role "${course.subscription.role}".`)
			if (!course.students) throw new Error('Invalid teacher course: student data is missing.')
			teacherCourses.push({ ...course, subscription: { ...course.subscription, role: 'teacher' }, students: course.students })
		})
		return { studentCourses, teacherCourses }
	}, [records])
	return { ...courses, loading, error }
}

export const MY_COURSES_QUERY: TypedDocumentNode<MyCoursesQueryData, Record<string, never>> = gql`
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
