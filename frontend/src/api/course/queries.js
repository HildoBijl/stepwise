import { gql, useQuery } from '@apollo/client'

// Define the fields we read for users.
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

export function useMyCoursesQuery() {
	return useQuery(MYCOURSES)
}
export const MYCOURSES = gql`
	{
		myCourses {
			${courseFields}
			role
		}
	}
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
