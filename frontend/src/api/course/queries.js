import { gql, useQuery } from '@apollo/client'

// Define the default fields we read for a course.
export const courseFields = `
	id
	code
	name
	description
	goals
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

export function useAllCoursesQuery() {
	return useQuery(ALLCOURSES)
}
export const ALLCOURSES = gql`
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
	return useQuery(MYCOURSES)
}
export const MYCOURSES = gql`
	{
		myCourses {
			${courseFields}
			role
			teachers {
				${teacherFields}
			}
		}
	}
`

export function useCourseForStudentQuery(code) {
	return useQuery(COURSEFORSTUDENT, { variables: { code } })
}
export const COURSEFORSTUDENT = gql`
	query courseForStudent($code: String!) {
		courseForStudent(code: $code) {
			${courseFields}
			role
			teachers {
				${teacherFields}
			}
		}
	}
`
