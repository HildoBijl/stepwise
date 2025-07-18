import React from 'react'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from './CourseProvider'

export function CourseName() {
	const { course } = useCourseData()
	const courseInfoPath = 'eduContent/courseInfo'
	if (!course)
		return <TitleItem path="eduTools/pages/coursePage" entry="unknownCourse.title" name="Unknown course" />
	return <TitleItem path={courseInfoPath} entry={`${course.code}.name`} name={course.name} />
}
