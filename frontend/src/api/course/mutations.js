import { useMutation, gql } from '@apollo/client'

import { courseFields } from './queries'

export function useCreateCourseMutation() {
	const [createCourse, data] = useMutation(CREATE_COURSE)
	const newCreateCourse = input => createCourse({ variables: { input } })
	return [newCreateCourse, data]
}
const CREATE_COURSE = gql`
	mutation createCourse($input: CreateCourseInput!) {
		createCourse(input: $input) {
			${courseFields}
		}
	}
`
