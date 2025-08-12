import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, AlertTitle } from '@material-ui/lab'

import { Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'

import { useCourseData } from './components'

const translationPath = 'eduTools/pages/courseSettingsPage'

export function CourseSettingsPage() {
	const { loading, error, course } = useCourseData()

	// If we are on this page but the user is not subscribed, go back to the course overview. This is usually used after unsubscribing from a course.
	const paths = usePaths()
	const navigate = useNavigate()
	useEffect(() => {
		if (course && !course.role)
			navigate(paths.courses(), { replace: true })
	}, [course, paths, navigate])

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
		return <CourseSettingsPageForStudent />
	if (course.role === 'teacher')
		return <CourseSettingsPageForTeacher />
	return null
}

function CourseSettingsPageForStudent() {
	return <p>You are a student</p>
}

function CourseSettingsPageForTeacher() {
	return <p>You are a teacher</p>
}
