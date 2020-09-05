import React from 'react'
import { useRouteMatch } from 'react-router-dom'

import { useCourses } from './CoursesPage'

// ToDo: delete this file if it's not used.
export default function CoursePage() {
	const courses = useCourses()
	const { params } = useRouteMatch()
	const courseId = parseInt(params.courseId)

	if (!courses)
		return <p>Loading...</p>

	const course = courses.find(course => parseInt(course.id) === courseId)
	if (!course)
		return <p>Course not found...</p>

	return <p>This course is about {course.name}.</p>
}

export function useCourseTitle() {
	const courses = useCourses()
	const { params } = useRouteMatch()
	const courseId = parseInt(params.courseId)

	if (!courses)
		return 'Loading...'

	const course = courses.find(course => parseInt(course.id) === courseId)
	if (!course)
		return 'Unknown course'

	return course.name
}
