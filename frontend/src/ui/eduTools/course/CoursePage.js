import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, AlertTitle } from '@material-ui/lab'

import { Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'

import { useCourseData } from './components'
import { CoursePageForUnsubscribedUser } from './CoursePageForUnsubscribedUser'
import { CoursePageForStudent } from './CoursePageForStudent'
import { CoursePageForTeacher } from './CoursePageForTeacher'

const translationPath = 'eduTools/pages/coursePage'

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
		return <Translation path={translationPath} entry="loading.loadingCourse">
			<Alert severity="info">
				<AlertTitle>Loading course...</AlertTitle>
				We are loading the course from the database. This shouldn't take long.
			</Alert>
		</Translation>
	if (error || !course)
		return <Translation path={translationPath} entry="loading.failedLoadingCourse">
			<Alert severity="error">
				<AlertTitle>Loading course failed</AlertTitle>
				Oops ... something went wrong loading the course. Maybe the course doesn't exist? Maybe it's your connection? Maybe our server is down? We're not sure! Make sure the URL is correct, try refreshing the page, and otherwise try again later.
			</Alert>
		</Translation>

	// When we do have data, determine what page to show.
	if (course.role === 'student')
		return <CoursePageForStudent />
	if (course.role === 'teacher')
		return <CoursePageForTeacher />
	return <CoursePageForUnsubscribedUser />
}
