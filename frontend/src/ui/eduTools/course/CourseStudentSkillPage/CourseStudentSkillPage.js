import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

import { repeat, count } from 'step-wise/util'
import { skillTree, getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { Par, LoadingIndicator, ErrorNote } from 'ui/components'

import { SkillFlask } from '../../skills'
import { processStudent } from '../../courses'

import { useCourseData } from '../components'

const translationPath = `eduTools/pages/courseStudentSkillPage`

export function CourseStudentSkillPage() {
	// Load in required data.
	const { studentId } = useParams()
	const { course, loading: courseLoading, error: courseError } = useCourseData()
	const { data, loading: userLoading, error: userError } = useUserQuery(studentId)

	// Check if the data is already present.
	if (userLoading || courseLoading)
		return <LoadingIndicator />
	if (userError || courseError)
		return <ErrorNote error={userError} />
	return <CourseStudentSkillPageForStudent course={course} student={data.user} />
}

export function CourseStudentSkillPageForStudent({ course, student }) {
	return <Par>This page is still under development. In it, you can examine the exercises a student made.</Par>
}
