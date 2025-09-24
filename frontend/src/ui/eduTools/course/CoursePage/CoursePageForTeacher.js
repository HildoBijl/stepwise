import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Box, Tooltip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { count, arraysToObject, keysToObject } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData, getCourseOverview } from 'step-wise/eduTools'

import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { Par, ProgressIndicator } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { getAnalysis } from '../../courses'

import { useCourseData } from '../components'

const translationPath = 'eduTools/pages/coursePage'
const translationSection = 'teachers'

export function CoursePageForTeacher() {
	const { course } = useCourseData()
	const paths = usePaths()
	console.log(course)

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

	// Check out the course and define columns based on it.
	const overview = useMemo(() => getCourseOverview(course), [course])
	console.log(overview)
	const { blocks } = overview
	const dgColumns = useMemo(() => [
		{
			field: 'name',
			headerName: 'Name',
			minWidth: 120,
			flex: 2,
			align: 'left',
			headerAlign: 'left'
		},
		{
			field: 'all',
			headerName: 'Course',
			minWidth: 80,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderCell: cell => <CenteredProgressIndicator total={overview.contents.length} done={cell.value} sx={{ fontWeight: 600 }} />
		},
		...overview.blocks.map((block, index) => ({
			field: `block${index}`,
			headerName: `${index + 1}`,
			minWidth: 60,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader: cell => <Tooltip title={translate(block.name, `${course.organization}.${course.code}.blocks.${index}`, 'eduContent/courseInfo')} arrow>
				<Box component="span" sx={{ fontWeight: 500 }}>{cell.colDef.headerName}</Box>
			</Tooltip>,
			renderCell: cell => <CenteredProgressIndicator total={overview.blocks[index].contents.length} done={cell.value} />
		})),
	], [course, overview, translate])

	// Process the student data and set up rows based on it.
	const processedStudents = useProcessedStudents(students, overview)
	const dgRows = useMemo(() => processedStudents.map(student => {
		return {
			id: student.id,
			name: student.name,
			all: student.numCompleted,
			...arraysToObject(blocks.map((_, index) => `block${index}`), blocks.map((block, index) => student.numCompletedPerBlock[index])),
		}
	}), [processedStudents, blocks])

	return <DataGrid
		rows={dgRows}
		columns={dgColumns}
		initialState={{
			sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
		}}
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

		// Return the resulting skills data set as property of the student and add an analysis for the course.
		const analysis = getAnalysis(overview, skillsData)
		const getNumCompleted = skillIds => count(skillIds, (skillId) => analysis.practiceNeeded[skillId] === 0)
		const numCompleted = getNumCompleted(overview.contents)
		const numCompletedPerBlock = overview.blocks.map(block => getNumCompleted(block.contents))
		return { ...student, skillsData, analysis, numCompleted, numCompletedPerBlock }
	}), [students, overview])
}

function CenteredProgressIndicator(props) {
	return <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
		<ProgressIndicator {...props} />
	</Box>
}
