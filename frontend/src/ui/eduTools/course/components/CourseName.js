import React from 'react'
import { useParams } from 'react-router-dom'

import { TitleItem } from 'ui/layout/Title'

import { courses } from '../../courses'

export function CourseName() {
	const { courseId } = useParams()
	const course = courses[courseId.toLowerCase()]
	const courseInfoPath = 'eduContent/courseInfo'
	if (!course)
		return <TitleItem path="eduTools/pages/coursePage" entry="unknownCourse.title" name="Unknown course" />
	return <TitleItem path={courseInfoPath} entry={`${course.id}.name`} name={course.name} />
}
