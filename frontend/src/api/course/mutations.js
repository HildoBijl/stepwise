import { useMutation, gql } from '@apollo/client'

import { courseFields, courseForStudentFields, MY_COURSES } from './queries'

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

export function useSubscribeToCourseMutation() {
	const [subscribe, data] = useMutation(SUBSCRIBE_TO_COURSE, {
		update(cache, { data }) { // Add an update function to automatically update the myCourses query.
			// Load the newly subscribed course.
			const newCourse = data?.subscribeToCourse
			if (!newCourse)
				return

			// If the myCourses query has never been run, or if the new course is already present in it, don't run an update.
			const existing = cache.readQuery({ query: MY_COURSES })
			if (!existing)
				return
			if (existing.myCourses.some(course => course.id === newCourse.id))
				return

			// Write the updated query.
			cache.writeQuery({
				query: MY_COURSES,
				data: { myCourses: [...existing.myCourses, newCourse] },
			})
		}
	})
	const subscribeToCourse = courseId => subscribe({ variables: { courseId } })
	return [subscribeToCourse, data]
}
const SUBSCRIBE_TO_COURSE = gql`
	mutation subscribeToCourse($courseId: ID!) {
		subscribeToCourse(courseId: $courseId) {
			${courseForStudentFields}
		}
	}
`
