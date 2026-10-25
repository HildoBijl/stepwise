import React from 'react'
import { TranslationCatalog, TranslationFolder, TranslationGroup } from '@step-wise/i18n'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from './CourseProvider'

export function CourseName() {
	const { loading, error, course } = useCourseData()
	if (loading)
		return <TranslationFolder path={['eduTools', 'pages']}><TranslationCatalog name="coursePage"><TranslationGroup path="loading"><TitleItem id="loadingCourseTitle" name="Loading course..." /></TranslationGroup></TranslationCatalog></TranslationFolder>
	if (error || !course)
		return <TranslationFolder path={['eduTools', 'pages']}><TranslationCatalog name="coursePage"><TranslationGroup path="loading"><TitleItem id="unknownCourseTitle" name="Unknown course" /></TranslationGroup></TranslationCatalog></TranslationFolder>
	return <TitleItem path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.name`} name={course.name} />
}
