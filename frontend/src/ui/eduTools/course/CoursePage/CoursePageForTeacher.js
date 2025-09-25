import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, Tooltip, FormGroup, FormControlLabel, Switch } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { count, arraysToObject, keysToObject, findOptimum } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData, getCourseOverview } from 'step-wise/eduTools'

import { useLocalStorageState } from 'util'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { Par, ProgressIndicator, TimeAgo } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { getAnalysis } from '../../courses'

import { useCourseData } from '../components'

const translationPath = 'eduTools/pages/coursePage'
const translationSection = 'teachers'

export function CoursePageForTeacher() {
	const { course } = useCourseData()
	const paths = usePaths()

	// When there are no students, show a note.
	const { students } = course
	if (!students || students.length === 0)
		return <TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Translation entry="noStudents">
					<Par>Your course is ready, but there are no students yet. Share the <Link to={paths.course({ courseCode: course.code })}>course link</Link> (this page's URL) with students, or ask them to <Link to={paths.addCourse()}>add the course</Link> from the full list.</Par>
					<Par>For further options, check out the <Link to={paths.courseSettings({ courseCode: course.code })}>Course Settings</Link> (top right).</Par>
				</Translation>
			</TranslationSection>
		</TranslationFile >

	// On students, show the overview.
	return <StudentOverview course={course} students={students} />
}

function StudentOverview({ course, students }) {
	const translate = useTranslator()
	const [filterInactive, setFilterInactive] = useLocalStorageState(false)

	// Check out the course and define columns based on it.
	const overview = useMemo(() => getCourseOverview(course), [course])
	const { blocks } = overview
	const renderHeader = cell => <Box component="span" sx={{ fontWeight: 500 }}>{cell.colDef.headerName}</Box>
	const dgColumns = useMemo(() => [
		{
			field: 'name',
			headerName: <Translation entry="headers.name">Name</Translation>,
			minWidth: 140,
			flex: 2,
			align: 'left',
			headerAlign: 'left',
			renderHeader,
		},
		{
			field: 'lastActive',
			headerName: <Translation entry="headers.lastActive">Last active</Translation>,
			minWidth: 105,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader,
			renderCell: cell => <TimeAgo>{new Date() - cell.value}</TimeAgo>,
		},
		{
			field: 'all',
			headerName: <Translation entry="headers.course">Course</Translation>,
			minWidth: 80,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader,
			renderCell: cell => <CenteredProgressIndicator total={overview.contents.length} done={cell.value} sx={{ fontWeight: 600 }} />,
		},
		...overview.blocks.map((block, index) => ({
			field: `block${index}`,
			headerName: `${index + 1}`,
			minWidth: 60,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader: cell => <Tooltip title={translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')} arrow>
				{renderHeader(cell)}
			</Tooltip>,
			renderCell: cell => <CenteredProgressIndicator total={overview.blocks[index].contents.length} done={cell.value} />,
		})),
	], [course, overview, translate])

	// Process the student data and potentially filter out inactive students.
	let processedStudents = useProcessedStudents(students, overview)
	const inactiveStudentThreshold = 14 * 24 * 60 * 60 * 1000 // 2 weeks
	// const inactiveStudentThreshold = 2 * 30 * 24 * 60 * 60 * 1000 // 2 months
	const now = new Date()
	const areInactiveStudents = processedStudents.some(student => now - student.lastActive > inactiveStudentThreshold)
	if (areInactiveStudents && filterInactive)
		processedStudents = processedStudents.filter(student => now - student.lastActive <= inactiveStudentThreshold)

	// Set up rows for the students.
	const dgRows = useMemo(() => processedStudents.map(student => {
		return {
			id: student.id,
			name: student.name,
			lastActive: student.lastActive,
			all: student.numCompleted,
			...arraysToObject(blocks.map((_, index) => `block${index}`), blocks.map((block, index) => student.numCompletedPerBlock[index])),
		}
	}), [processedStudents, blocks])

	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<DataGrid
				rows={dgRows}
				columns={dgColumns}
				sortingOrder={['asc', 'desc']} // Always have some sort present.
				initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }} // Initially sort by name.
				pagination={false}
				hideFooter
				disableColumnMenu
				disableColumnResize
				disableSelectionOnClick disableRowSelectionOnClick
				onRowClick={row => console.log('Click on row', row)} // ToDo: add link to inspection page.
				sx={{
					cursor: 'pointer',
					'& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
						outline: 'red', // Prevent a cell outline when clicking on a cell.
					},
				}}
			/>

			{areInactiveStudents ? <Par>
				<FormGroup>
					<FormControlLabel control={<Switch checked={filterInactive} onChange={event => setFilterInactive(event.target.checked)} sx={{ ml: 1 }} />} label={<Translation entry="hideInactive">Hide inactive students</Translation>} />
				</FormGroup>
			</Par> : null}
		</TranslationSection>
	</TranslationFile>
}

function useProcessedStudents(students, overview) {
	return useMemo(() => students.map(student => {
		// Filter out outdated none-existing skills, process the remaining skills, and turn them into an ID-keyed object (a raw dataset).
		const skillsProcessed = student.skills.filter(skill => skillTree[skill.skillId]).map(skill => processSkill(skill))
		const skillsAsObject = arraysToObject(skillsProcessed.map(skill => skill.skillId), skillsProcessed)

		// Add skills that are not in the data set. (These are skills that are not in the database yet.)
		const allSkillIds = includePrerequisitesAndLinks(overview.all)
		const skills = keysToObject(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId))
		const skillsData = processSkillDataSet(skills, skillTree)

		// Run an analysis of what the student completed.
		const analysis = getAnalysis(overview, skillsData)
		const getNumCompleted = skillIds => count(skillIds, (skillId) => analysis.practiceNeeded[skillId] === 0)
		const numCompleted = getNumCompleted(overview.contents)
		const numCompletedPerBlock = overview.blocks.map(block => getNumCompleted(block.contents))

		// Determine the last activity for the student. (Use the original skills and not the newly added skills, that have more recent dates.)
		const activityPerSkill = skillsProcessed.filter(skill => overview.all.includes(skill.skillId)).map(skill => skill.updatedAt)
		const lastActive = findOptimum(activityPerSkill, (a, b) => a > b)

		// Return all data.
		return { ...student, skillsData, analysis, numCompleted, numCompletedPerBlock, lastActive }
	}), [students, overview])
}

function CenteredProgressIndicator(props) {
	return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
		<ProgressIndicator {...props} />
	</Box>
}
