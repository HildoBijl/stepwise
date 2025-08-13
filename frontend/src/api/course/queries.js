import { gql, useQuery } from '@apollo/client'

// Define the default fields we read for a course.
export const courseFields = `
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
`

export const teacherFields = `
	id
	name
	givenName
	familyName
`

export const courseForStudentFields = `
	${courseFields}
	role
	subscribedOn
	teachers {
		${teacherFields}
	}
`

export function useAllCoursesQuery() {
	return useQuery(ALL_COURSES)
}
export const ALL_COURSES = gql`
	{
		allCourses {
			${courseFields}
		}
	}
`

export function useCourseQuery(code) {
	return useQuery(COURSE, { variables: { code } })
}
export const COURSE = gql`
	query course($code: String!) {
		course(code: $code) {
			${courseFields}
		}
	}
`

export function useMyCoursesQuery() {
	return useQuery(MY_COURSES)
}
export const MY_COURSES = gql`
	{
		myCourses {
			${courseForStudentFields}
		}
	}
`

export function useAllCoursesForStudentQuery() {
	return useQuery(ALL_COURSES_FOR_STUDENT)
}
export const ALL_COURSES_FOR_STUDENT = gql`
	{
		allCoursesForStudent {
			${courseForStudentFields}
		}
	}
`

export function useCourseForStudentQuery(code) {
	return useQuery(COURSEFORSTUDENT, { variables: { code } })
}
export const COURSEFORSTUDENT = gql`
	query courseForStudent($code: String!) {
		courseForStudent(code: $code) {
			${courseForStudentFields}
		}
	}
`
