import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Translation } from 'i18n'
import { usePaths } from 'ui/routingTools'
import { LoadingIndicator, ErrorNote } from 'ui/components'

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
		return <LoadingIndicator />
	if (error || !course)
		return <ErrorNote />

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
