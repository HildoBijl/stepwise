import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

import { repeat, count } from 'step-wise/util'
import { skillTree, getCourseOverview } from 'step-wise/eduTools'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { LoadingIndicator, ErrorNote } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { SkillFlask } from '../../skills'
import { processStudent } from '../../courses'

import { useCourseData, CenteredProgressIndicator } from '../components'

const translationPath = `eduTools/pages/courseStudentPage`

export function CourseStudentPage() {
	// Load in required data.
	const { studentId } = useParams()
	const { course, loading: courseLoading, error: courseError } = useCourseData()
	const { data, loading: userLoading, error: userError } = useUserQuery(studentId)

	// Check if the data is already present.
	if (userLoading || courseLoading)
		return <LoadingIndicator />
	if (userError || courseError)
		return <ErrorNote error={userError} />
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
	const paths = usePaths()
	const navigate = useNavigate()
	const numSkillColumns = useMemo(() => Math.max(...overview.blocks.map(block => block.contents.length)), [overview])

	// Render the overview.
	return <TranslationSection entry="progressOverview">
		<TableContainer component={Paper}>
			<Table sx={{ width: '100%', tableLayout: 'fixed', '& td, & th': { px: 0.5 }, '& td': { py: 0.75 }, '& th': { py: 1.25 } }}>
				<TableHead>
					<TableRow>
						<TableCell align="center" sx={{ minWidth: 40, width: 40 }} />
						<TableCell sx={{ minWidth: 140, width: `${125 / (numSkillColumns + 2)}%` }}><Translation entry="block">Block</Translation></TableCell>
						<TableCell sx={{ minWidth: 80, width: `${75 / (numSkillColumns + 2)}%` }} align="center"><Translation entry="progress">Progress</Translation></TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" sx={{ minWidth: 110, width: `${100 / (numSkillColumns + 2)}%` }} />)}
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
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" onClick={() => navigate(paths.courseStudentSkill({ courseCode: course.code, studentId: processedStudent.id, skillId: block.contents[index] }))} sx={{ verticalAlign: 'top', cursor: 'pointer', '&:hover': { backgroundColor: theme => theme.palette.action.hover } }}>
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

	// Determine number of correct, incorrect and in-progress.
	const exercises = skillData.exercises
	const numCorrect = count(exercises, exercise => exercise.progress.solved && exercise.history.length === 1)
	const numPartiallyCorrect = count(exercises, exercise => exercise.progress.solved && exercise.history.length > 1)
	const numIncorrect = count(exercises, exercise => !exercise.progress.solved && exercise.progress.done)
	const numInProgress = count(exercises, exercise => !exercise.progress.done)

	// Render the contents.
	return <Box sx={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', justifyContent: 'flex-start', gap: '4px' }}>
		<Box sx={{ position: 'relative' }}>
			<SkillFlask skillId={skillId} coef={skillData.coefficients} isPriorKnowledge={isPriorKnowledge} size={40} tooltip={false} />
			<Box sx={{ position: 'absolute', right: -12, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>
				{numCorrect === 0 ? null : <Box component="span" sx={{ color: 'success.main' }}>{numCorrect}</Box>}
				{numPartiallyCorrect === 0 ? null : <Box component="span" sx={{ color: 'warning.main' }}>{numPartiallyCorrect}</Box>}
				{numIncorrect === 0 ? null : <Box component="span" sx={{ color: 'error.main' }}>{numIncorrect}</Box>}
				{numInProgress === 0 ? null : <Box component="span" sx={{ color: 'info.main' }}>{numInProgress}</Box>}
			</Box>
		</Box>
		<Box sx={{ fontSize: 8, fontWeight: 500 }}>
			{translate(skill.name, `${skill.path.join('.')}.${skill.id}`, 'eduContent/skillNames')}
		</Box>
	</Box>
}
