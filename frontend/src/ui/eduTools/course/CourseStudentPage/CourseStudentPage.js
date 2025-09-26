import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
// import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Par, LoadingIndicator, ErrorNote } from 'ui/components'

import { processStudent } from '../../courses'

import { useCourseData } from '../components'

// const translationPath = `eduTools/pages/courseStudentPage`
// const translationSection = 'table'

export function CourseStudentPage() {
	// Load in required data.
	const { course } = useCourseData()
	const { studentId } = useParams()
	const { data, loading, error } = useUserQuery(studentId)

	// Check if the data is already present.
	if (loading)
		return <LoadingIndicator />
	if (error || !course)
		return <ErrorNote error={error} />
	return <CourseStudentPageForStudent course={course} student={data.user} />
}

export function CourseStudentPageForStudent({ course, student }) {
	const overview = useMemo(() => getCourseOverview(course), [course])
	const processedStudent = useMemo(() => processStudent(student, overview), [student, overview])
	console.log(processedStudent)
	return <Par>The page to inspect a student will appear here. It is still under construction.</Par>
}
