import React from 'react'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from './CourseProvider'

export function CourseName() {
	const { loading, error, course } = useCourseData()
	const courseInfoPath = 'eduContent/courseInfo'
	if (loading)
		return <TitleItem path="eduTools/pages/coursePage" entry="loadingCourseTitle" name="Loading course..." />
	if (error || !course)
		return <TitleItem path="eduTools/pages/coursePage" entry="unknownCourseTitle" name="Unknown course" />
	return <TitleItem path={courseInfoPath} entry={`${course.code}.name`} name={course.name} />
}
