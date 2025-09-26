import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

import { repeat } from 'step-wise/util'
import { getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { LoadingIndicator, ErrorNote } from 'ui/components'

import { processStudent } from '../../courses'

import { useCourseData, CenteredProgressIndicator } from '../components'

const translationPath = `eduTools/pages/courseStudentPage`
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
	// Process the given data.
	const overview = useMemo(() => getCourseOverview(course), [course])
	const processedStudent = useMemo(() => processStudent(student, overview), [student, overview])

	// Render the various page parts.
	return <TranslationFile path={translationPath}>
		<LastActivity />
		<ProgressOverview {...{ processedStudent, course, overview }} />
	</TranslationFile>
}

function LastActivity() {
	return null // ToDo
}

function ProgressOverview({ processedStudent, course, overview }) {
	const translate = useTranslator()
	console.log(processedStudent, overview)

	const numSkillColumns = useMemo(() => Math.max(...overview.blocks.map(block => block.contents.length)), [overview])
	return <TranslationSection entry="progressOverview">
		<TableContainer component={Paper}>
			<Table sx={{ width: '100%', '& td, & th': { px: 0.5 }, '& td': { py: 0.75 }, '& th': { py: 1.25 } }}>
				<TableHead>
					<TableRow>
						<TableCell align="center" sx={{ minWidth: 30, width: 40 }} />
						<TableCell sx={{ minWidth: 140 }}>Block</TableCell>
						<TableCell sx={{ minWidth: 60 }} align="center">Progress</TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" sx={{ minWidth: 80 }} />)}
					</TableRow>
				</TableHead>
				<TableBody>
					{overview.blocks.map((block, index) => <TableRow key={index}>
						<TableCell align="center" sx={{ fontWeight: 450, color: 'primary.main' }}>{index + 1}</TableCell>
						<TableCell sx={{}}>{translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')}</TableCell>
						<TableCell align="center"><CenteredProgressIndicator total={block.contents.length} done={processedStudent.numCompletedPerBlock[index]} /></TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" sx={{ fontSize: 5 }}>{block.contents[index] || null}</TableCell>)}
					</TableRow>)}
				</TableBody>
			</Table>
		</TableContainer>
	</TranslationSection>
}
