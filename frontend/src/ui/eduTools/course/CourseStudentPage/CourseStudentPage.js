import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

import { last, repeat, count } from '@step-wise/js-utils'
import { skillTree } from '@step-wise/skill-tree'
import { hasExercises } from '@step-wise/exercises'

import { useUserQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { Head, Par, TimeAgo, LoadingIndicator, ErrorNote } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { SkillFlask } from '../../skills'
import { processStudent } from '../../courses'

import { getExerciseOutcome } from '../util'
import { useCourseData, CenteredProgressIndicator } from '../components'

const translationPath = `eduTools/pages/courseStudentPage`

export function CourseStudentPage() {
	// Load in required data.
	const { studentId } = useParams()
	const { course, overview, loading: courseLoading, error: courseError } = useCourseData()
	const { data, loading: userLoading, error: userError } = useUserQuery(studentId)

	// Check if the data is already present.
	if (userLoading || courseLoading)
		return <LoadingIndicator />
	if (userError || courseError)
		return <ErrorNote error={userError} />
	return <CourseStudentPageForStudent course={course} overview={overview} student={data.user} />
}

export function CourseStudentPageForStudent({ course, overview, student }) {
	// Process the given data.
	const processedStudent = useMemo(() => processStudent(student, overview), [student, overview])

	// Render the various page parts.
	return <TranslationFile path={translationPath}>
		<LastActivity {...{ processedStudent, course, overview }} />
		<ProgressOverview {...{ processedStudent, course, overview }} />
	</TranslationFile>
}

function LastActivity({ processedStudent, course, overview }) {
	const translate = useTranslator()
	const paths = usePaths()
	const navigate = useNavigate()

	// Use only skills within the course that have exercises and have any type of activity. Sort them by the activity date.
	const getLastSkillActivity = skill => {
		if (skill.exercises.length === 0) return undefined
		const lastExercise = last(skill.exercises)
		if (lastExercise.history.length === 0) return new Date(lastExercise.startedAt)
		const lastEvent = last(lastExercise.history)
		return new Date(lastEvent.performedAt)
	}
	let skills = processedStudent.skills.filter(skill => hasExercises(skill.skillId) && overview.allSkillIds.includes(skill.skillId))
	skills = skills.filter(skill => getLastSkillActivity(skill) !== undefined)
	skills = skills.sort((s1, s2) => getLastSkillActivity(s2) - getLastSkillActivity(s1))

	// Render the skills.
	const numEntries = 2
	return <TranslationSection entry="lastActivity">
		<Head sx={{ mb: 1 }}><Translation entry="head">Last activity</Translation></Head>
		{skills.length === 0 ?
			<Par><Translation entry="noActivity">There has been no activity yet within this course.</Translation></Par> :
			<TableContainer component={Paper}>
				<Table sx={{ width: '100%', '& td': { py: 1 } }}>
					<TableBody>
						{repeat(Math.min(numEntries, skills.length), index => {
							const studentSkill = skills[index]
							const skill = skillTree[studentSkill.skillId]
							const lastActivity = getLastSkillActivity(studentSkill)
							return <TableRow key={index} onClick={() => navigate(paths.courseStudentSkill({ courseCode: course.code, studentId: processedStudent.id, skillId: skill.id }))} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: theme => theme.palette.action.hover } }}>
								<TableCell align="center" sx={{ minWidth: 80, width: 100, fontSize: 12, fontWeight: 450, color: 'primary.main' }}>
									<TimeAgo date={lastActivity} addAgo={true} />
								</TableCell>
								<TableCell align="center" sx={{ minWidth: 60, width: 80 }}>
									<SkillFlaskWithNumbers skillId={skill.id} student={processedStudent} overview={overview} />
								</TableCell>
								<TableCell sx={{ minWidth: 140, width: 800 }}>
									{translate(skill.name, `${skill.groupPath.join('.')}.${skill.id}`, 'eduContent/skillNames')}
								</TableCell>
							</TableRow>
						})}
					</TableBody>
				</Table>
			</TableContainer>}
	</TranslationSection >
}

function ProgressOverview({ processedStudent, course, overview }) {
	const translate = useTranslator()
	const paths = usePaths()
	const navigate = useNavigate()
	const numSkillColumns = useMemo(() => Math.max(...overview.blocks.map(block => block.contentSkillIds.length)), [overview])

	// Render the overview.
	return <TranslationSection entry="progressOverview">
		<Head sx={{ mb: 1 }}><Translation entry="head">Course progress</Translation></Head>
		<TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
			<Table sx={{ width: '100%', tableLayout: 'auto', '& td, & th': { px: 0.5 }, '& td': { py: 0.75 }, '& th': { py: 1.25 } }}>
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
							{translate(course.blocks[index].name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')}
						</TableCell>
						<TableCell align="center">
							<CenteredProgressIndicator size={50} total={block.contentSkillIds.length} done={processedStudent.analysis.numCompletedPerBlock[index]} />
						</TableCell>
						{repeat(numSkillColumns, index => <TableCell key={index} align="center" onClick={() => navigate(paths.courseStudentSkill({ courseCode: course.code, studentId: processedStudent.id, skillId: block.contentSkillIds[index] }))} sx={{ verticalAlign: 'top', cursor: 'pointer', '&:hover': { backgroundColor: theme => theme.palette.action.hover } }}>
							<SkillIndicator skillId={block.contentSkillIds[index]} student={processedStudent} overview={overview} />
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
	const skill = skillTree[skillId]

	// Render the contents.
	return <Box sx={{ display: 'flex', flexFlow: 'column nowrap', alignItems: 'center', justifyContent: 'flex-start', gap: '4px' }}>
		<SkillFlaskWithNumbers {...{ skillId, student, overview }} />
		<Box sx={{ fontSize: 8, fontWeight: 500 }}>
			{translate(skill.name, `${skill.groupPath.join('.')}.${skill.id}`, 'eduContent/skillNames')}
		</Box>
	</Box>
}

function SkillFlaskWithNumbers({ skillId, student, overview }) {
	// Extract data for the skill.
	const skillLevelSet = student.skillLevelSet
	const skill = student.skills.find(skill => skill.skillId === skillId)
	const isPriorKnowledge = overview.priorKnowledgeIds.includes(skillId)

	// Determine the number of correct, partially correct, incorrect and in-progress exercises. (Partially correct counts as correct on a second or later attempt. Incorrect is "given up" or "solved step-wise".)
	const exercises = skill?.exercises ?? []
	const numCorrect = count(exercises, exercise => getExerciseOutcome(exercise) === 'correct')
	const numPartiallyCorrect = count(exercises, exercise => getExerciseOutcome(exercise) === 'partiallyCorrect')
	const numIncorrect = count(exercises, exercise => getExerciseOutcome(exercise) === 'incorrect')
	const numInProgress = count(exercises, exercise => getExerciseOutcome(exercise) === 'inProgress')

	// Render the flask with the numbers.
	return <Box sx={{ position: 'relative', display: 'inline-block' }}>
		<SkillFlask skillId={skillId} coef={skillLevelSet.getInferredCoefficients(skillId)} isPriorKnowledge={isPriorKnowledge} size={40} tooltip={false} />
		<Box sx={{ position: 'absolute', right: -12, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', fontSize: 10, fontWeight: 700, lineHeight: 1 }}>
			{numCorrect === 0 ? null : <Box component="span" sx={{ color: 'success.main' }}>{numCorrect}</Box>}
			{numPartiallyCorrect === 0 ? null : <Box component="span" sx={{ color: 'warning.main' }}>{numPartiallyCorrect}</Box>}
			{numIncorrect === 0 ? null : <Box component="span" sx={{ color: 'error.main' }}>{numIncorrect}</Box>}
			{numInProgress === 0 ? null : <Box component="span" sx={{ color: 'info.main' }}>{numInProgress}</Box>}
		</Box>
	</Box>
}
