import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconButton, useMediaQuery } from '@mui/material'
import { Settings as SettingsIcon } from '@mui/icons-material'

import { useIsAdmin } from 'api'
import { usePaths } from 'ui/routingTools'
import { LoadingIndicator, ErrorNote } from 'ui/components'

import { useCourseData } from '../components'

import { CourseSettingsPageForStudent } from './CourseSettingsPageForStudent'
import { CourseSettingsPageForTeacher } from './CourseSettingsPageForTeacher'

export function CourseSettingsPage() {
	const { loading, error, course } = useCourseData()
	const isAdmin = useIsAdmin()

	// If we are on this page but the user is not subscribed, go back to the course overview. This is usually used after unsubscribing from a course.
	const paths = usePaths()
	const navigate = useNavigate()
	useEffect(() => {
		if (course && !course.role && !isAdmin)
			navigate(paths.courses(), { replace: true })
	}, [course, paths, navigate, isAdmin])

	// When we don't have the data, show a relevant indication of what's going on.
	if (loading)
		return <LoadingIndicator />
	if (error || !course)
		return <ErrorNote />

	// When we do have data, determine what page to show.
	if (isAdmin || course.role === 'teacher')
		return <CourseSettingsPageForTeacher />
	if (course.role === 'student')
		return <CourseSettingsPageForStudent />
	return null
}

export function CourseSettingsIcon() {
	const { course } = useCourseData()

	// Allow for navigation.
	const paths = usePaths()
	const navigate = useNavigate()

	// Determine the size, for responsive design.
	const smallScreen = !useMediaQuery(theme => theme.breakpoints.up('sm'))
	const size = smallScreen ? 28 : 34

	// When the course is loading (or failed to load) show nothing.
	if (!course)
		return null

	// Render the icon as link to the course settings page.
	return <IconButton edge="end" color="inherit" aria-label="courseSettings" onClick={() => navigate(paths.courseSettings({ courseCode: course.code }))} style={{ marginRight: '4px' }}>
		<SettingsIcon style={{ width: `${size}px`, height: `${size}px` }} />
	</IconButton>
}
