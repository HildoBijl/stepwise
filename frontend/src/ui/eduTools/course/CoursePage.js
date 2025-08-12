import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { usePaths } from 'ui/routingTools'
import { LoadingIndicator, ErrorNote } from 'ui/components'

import { useCourseData } from './components'
import { CoursePageForUnsubscribedUser } from './CoursePageForUnsubscribedUser'
import { CoursePageForStudent } from './CoursePageForStudent'
import { CoursePageForTeacher } from './CoursePageForTeacher'

export function CoursePage() {
	const { loading, error, course } = useCourseData()

	// If we are on the addCourse URL, and the user is already subscribed to the course, then adjust the URL to the regular course URL. (This is usually called right upon subscribing to a course.)
	const location = useLocation()
	const paths = usePaths()
	const navigate = useNavigate()
	useEffect(() => {
		if (course?.role && location.pathname.includes('/addCourse/'))
			navigate(paths.course({ courseCode: course.code }), { replace: true })
	}, [course, location, paths, navigate])

	// When we don't have the data, show a relevant indication of what's going on.
	if (loading)
		return <LoadingIndicator />
	if (error || !course)
		return <ErrorNote />

	// When we do have data, determine what page to show.
	if (course.role === 'student')
		return <CoursePageForStudent />
	if (course.role === 'teacher')
		return <CoursePageForTeacher />
	return <CoursePageForUnsubscribedUser />
}
