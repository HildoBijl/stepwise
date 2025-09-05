import { gql, useQuery } from '@apollo/client'

// Define the default fields we read for a course.
export const getCourseFields = (addTeachers = false, addStudents = false) => `
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
	... on CourseForStudent {
		${getCourseForStudentFields(addTeachers, addStudents)}
	}
	... on CourseForTeacher {
		${getCourseForTeacherFields(addTeachers, addStudents)}
	}
`

const getCourseForStudentFields = (addTeachers, addStudents) => `
		role
		subscribedOn
		${addTeachers ? `teachers {
			id
			name
			givenName
			familyName
		}` : ''}
`

const getCourseForTeacherFields = (addTeachers, addStudents) => `
		${getCourseForStudentFields(addTeachers, addStudents)}
		${addStudents ? `students {
			id
			name
			givenName
			familyName
		}` : ''}
`

export function useAllCoursesQuery(addTeachers = true, addStudents = false) {
	return useQuery(ALL_COURSES(addTeachers, addStudents))
}
export const ALL_COURSES = (addTeachers, addStudents) => gql`
	{
		allCourses {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useMyCoursesQuery(addTeachers = true, addStudents = false) {
	return useQuery(MY_COURSES(addTeachers, addStudents))
}
export const MY_COURSES = (addTeachers, addStudents) => gql`
	{
		myCourses {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useCourseQuery(code, addTeachers = true, addStudents = true) {
	return useQuery(COURSE(addTeachers, addStudents), { variables: { code } })
}
export const COURSE = (addTeachers, addStudents) => gql`
	query course($code: String!) {
		course(code: $code) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`
