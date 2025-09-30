import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

import { repeat } from 'step-wise/util'
import { skillTree, getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { LoadingIndicator, ErrorNote } from 'ui/components'

import { SkillFlask } from '../../skills'
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
	const numSkillColumns = useMemo(() => Math.max(...overview.blocks.map(block => block.contents.length)), [overview])

	// Render the overview.
	return <TranslationSection entry="progressOverview">
		<TableContainer component={Paper}>
			<Table sx={{ width: '100%', '& td, & th': { px: 0.5 }, '& td': { py: 0.75 }, '& th': { py: 1.25 } }}>
				<TableHead>
					<TableRow>
						<TableCell align="center" sx={{ minWidth: 40 }} />
						<TableCell sx={{ minWidth: 140 }}>Block</TableCell>
						<TableCell sx={{ minWidth: 80 }} align="center">Progress</TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" sx={{ minWidth: 100 }} />)}
					</TableRow>
				</TableHead>
				<TableBody>
					{overview.blocks.map((block, index) => <TableRow key={index}>
						<TableCell align="center" sx={{ fontWeight: 450, color: 'primary.main' }}>
							{index + 1}
						</TableCell>
						<TableCell sx={{}}>
							{translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')}
						</TableCell>
						<TableCell align="center">
							<CenteredProgressIndicator size={50} total={block.contents.length} done={processedStudent.numCompletedPerBlock[index]} />
						</TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center"sx={{ verticalAlign: 'top' }}>
							<SkillIndicator skillId={block.contents[index]} student={processedStudent} overview={overview} />
						</TableCell>)}
					</TableRow>)}
				</TableBody>
			</Table>
		</TableContainer>
	</TranslationSection>
}

function SkillIndicator({ skillId, student, overview }) {
	const translate = useTranslator()

	// When there's no skillId, we are through the skills of this block and don't need to show more.
	if (!skillId)
		return null

	// Extract data for the skill.
	const skill = skillTree[skillId]
	const skillData = student.skillsData[skillId]
	const isPriorKnowledge = overview.priorKnowledge.includes(skillId)

	// Render the contents.
	return <Box sx={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', justifyContent: 'flex-start', gap: '4px' }}>
		<Box>
			<SkillFlask skillId={skillId} coef={skillData.coefficients} isPriorKnowledge={isPriorKnowledge} size={40} />
		</Box>
		<Box sx={{ fontSize: 8, fontWeight: 500 }}>
			{translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}
		</Box>
	</Box>
}
