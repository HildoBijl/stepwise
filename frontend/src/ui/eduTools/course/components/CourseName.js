import React from 'react'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from './CourseProvider'

export function CourseName() {
	const { loading, error, course } = useCourseData()
	if (loading)
		return <TitleItem folder={['eduTools', 'pages']} catalog="coursePage" group={['loading']} id="loadingCourseTitle" name="Loading course..." />
	if (error || !course)
		return <TitleItem folder={['eduTools', 'pages']} catalog="coursePage" group={['loading']} id="unknownCourseTitle" name="Unknown course" />
	return <TitleItem path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.name`} name={course.name} />
}
