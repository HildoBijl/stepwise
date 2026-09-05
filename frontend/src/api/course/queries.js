import { useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import { skillFields } from '../skill'

import { courseRecordToCourseData } from './conversion'

// Define the default fields we read for a course.
export const getCourseFields = (addTeachers, addStudents, addSkills, addExercises) => `
	__typename
	id
	code
	name
	description
	organization
	goals
	goalWeights
	startingPoints
	setup
	blocks {
		name
		goals
	}
	createdAt
	updatedAt
	accessData {
		${courseForStudentFields(addTeachers)}
	}
	teacherData {
		${courseForTeacherFields(addTeachers, addStudents, addSkills, addExercises)}
	}
`

const courseForStudentFields = (addTeachers) => `
		role
		subscribedAt
		${addTeachers ? `teachers {
			id
			name
			givenName
			familyName
		}` : ''}
`

const courseForTeacherFields = (addTeachers, addStudents, addSkills, addExercises) => {
	const sharedFields = `
				email
		skills {
			${skillFields(addExercises)}
		}
	`
	return `
		${addStudents ? `
		students {
			id
			name
			givenName
			familyName
			${addSkills ? `
			sharedData {
				${sharedFields}
			}` : ``}
		}` : ''}
	`
}

export function useAllCoursesQuery(addTeachers = true, addStudents = false, addSkills = false, addExercises = false) {
	const result = useQuery(ALL_COURSES(addTeachers, addStudents, addSkills, addExercises))
	const data = useMemo(() => result.data ? { ...result.data, allCourses: result.data.allCourses.map(courseRecordToCourseData) } : undefined, [result.data])
	return { ...result, data }
}
export const ALL_COURSES = (addTeachers, addStudents, addSkills, addExercises) => gql`
	{
		allCourses {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`

export function useMyCoursesQuery(addTeachers = true, addStudents = false, addSkills = false, addExercises = false) {
	const result = useQuery(MY_COURSES(addTeachers, addStudents, addSkills, addExercises))
	const data = useMemo(() => result.data ? { ...result.data, myCourses: result.data.myCourses.map(courseRecordToCourseData) } : undefined, [result.data])
	return { ...result, data }
}
export const MY_COURSES = (addTeachers, addStudents, addSkills, addExercises) => gql`
	{
		myCourses {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`

export function useCourseQuery(code, addTeachers = true, addStudents = true, addSkills = true, addExercises = false) {
	const result = useQuery(COURSE(addTeachers, addStudents, addSkills, addExercises), { variables: { code } })
	const data = useMemo(() => result.data ? { ...result.data, course: courseRecordToCourseData(result.data.course) } : undefined, [result.data])
	return { ...result, data }
}
export const COURSE = (addTeachers, addStudents, addSkills, addExercises) => gql`
	query course($code: String!) {
		course(code: $code) {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`
