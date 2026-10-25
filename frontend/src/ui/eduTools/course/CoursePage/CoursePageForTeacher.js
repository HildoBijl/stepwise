import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Paper, Tooltip, FormGroup, FormControlLabel, Switch } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { fromKeysAndValues } from '@step-wise/js-utils'
import { useLocalStorageState } from '@step-wise/react-utils'
import { Translation, TranslationCatalog, TranslationGroup, withTranslation } from '@step-wise/i18n'

import { RelativeTime } from 'i18nNext'
import { notSelectable } from 'ui/theme'
import { Par, Info } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { processStudentForCourse } from '../../courses'

import { useCourseData, CenteredProgressIndicator } from '../components'
import { CourseTranslation } from '../components/CourseTranslation'

const translationSection = 'teachers'
const TranslationLink = withTranslation(Link, { tag: 'link' })

export function CoursePageForTeacher() {
	const { course, courseDefinition } = useCourseData()
	const paths = usePaths()

	// When there are no students, show a note.
	const { students } = course
	if (!students || students.length === 0)
		return <TranslationCatalog folder={['eduTools', 'pages']} name="coursePage">
			<TranslationGroup path={translationSection}>
				<Translation id="noStudents">
					<Par>Your course is ready, but there are no students yet. Share the <TranslationLink to={paths.course({ courseCode: course.code })}>course link</TranslationLink> (this page's URL) with students, or ask them to <TranslationLink to={paths.addCourse()}>add the course</TranslationLink> from the full list.</Par>
					<Par>For further options, check out the <TranslationLink to={paths.courseSettings({ courseCode: course.code })}>Course Settings</TranslationLink> (top right).</Par>
				</Translation>
			</TranslationGroup>
		</TranslationCatalog>

	// On students, show the course definition.
	return <StudentOverview course={course} courseDefinition={courseDefinition} students={students} />
}

function StudentOverview({ course, courseDefinition, students }) {
	const [filterInactive, setFilterInactive] = useLocalStorageState(`hide-inactive-students-${course.code}`, false)
	const navigate = useNavigate()
	const paths = usePaths()

	// Check out the course and define columns based on it.
	const { blocks } = courseDefinition
	const renderHeader = cell => <Box component="span" sx={{ fontWeight: 500, ...notSelectable }}>{cell.colDef.headerName}</Box>
	const dgColumns = useMemo(() => [
		{
			field: 'name',
			sortingOrder: ['asc', 'desc'], // Go for ascending order first for names.
			headerName: <Translation group={['teachers', 'headers']} id="name">Name</Translation>,
			minWidth: 140,
			flex: 2,
			align: 'left',
			headerAlign: 'left',
			renderHeader,
		},
		{
			field: 'lastActive',
			sortingOrder: ['asc', 'desc'], // Go for ascending order first for times.
			headerName: <Translation group={['teachers', 'headers']} id="lastActive">Last active</Translation>,
			minWidth: 105,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader,
			renderCell: cell => <RelativeTime date={cell.value} />,
			sortComparator: (v1, v2) => {
				const a = v1 === undefined || v1 === null ? Infinity : -new Date(v1).getTime()
				const b = v2 === undefined || v2 === null ? Infinity : -new Date(v2).getTime()
				return a - b
			},
		},
		{
			field: 'all',
			headerName: <Translation group={['teachers', 'headers']} id="course">Course</Translation>,
			minWidth: 80,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader,
			renderCell: cell => <CenteredProgressIndicator total={courseDefinition.contentSkillIds.length} done={cell.value} sx={{ fontWeight: 600 }} />,
		},
		...courseDefinition.blocks.map((_, index) => ({
			field: `block${index}`,
			headerName: `${index + 1}`,
			minWidth: 60,
			flex: 1,
			align: 'center',
			headerAlign: 'center',
			renderHeader: cell => <Tooltip title={<CourseTranslation course={course} block={index} />} arrow>
				{renderHeader(cell)}
			</Tooltip>,
			renderCell: cell => <CenteredProgressIndicator total={courseDefinition.blocks[index].contentSkillIds.length} done={cell.value} />,
		})),
	], [course, courseDefinition])

	// Process the student data and potentially filter out inactive students.
	let processedStudents = useMemo(() => students.map(student => processStudentForCourse(student, courseDefinition)), [students, courseDefinition])
	const inactiveStudentThreshold = 2 * 30 * 24 * 60 * 60 * 1000 // 2 months
	const isStudentInactive = student => student.lastActive === undefined || new Date() - student.lastActive > inactiveStudentThreshold
	const areInactiveStudents = processedStudents.some(isStudentInactive)
	if (areInactiveStudents && filterInactive)
		processedStudents = processedStudents.filter(student => !isStudentInactive(student))

	// Set up rows for the students.
	const dgRows = useMemo(() => processedStudents.map(student => {
		return {
			id: student.id,
			name: student.name,
			lastActive: student.lastActive,
			all: student.analysis.numCompleted,
			...fromKeysAndValues(blocks.map((_, index) => `block${index}`), blocks.map((block, index) => student.analysis.numCompletedPerBlock[index])),
		}
	}), [processedStudents, blocks])

	// Render the data grid.
	return <TranslationCatalog folder={['eduTools', 'pages']} name="coursePage">
		<TranslationGroup path={translationSection}>
			{processedStudents.length > 0 ? <Paper elevation={3}>
				<DataGrid
					rows={dgRows}
					columns={dgColumns}
					sortingOrder={['desc', 'asc']} // Always have some sort present. Use descending first.
					initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'asc' }] } }} // Initially sort by name.
					pagination={false}
					hideFooter
					disableColumnMenu
					disableColumnResize
					disableRowSelectionOnClick
					onRowClick={row => navigate(paths.courseStudent({ courseCode: course.code, studentId: row.id }))}
					sx={{
						backgroundColor: 'background.paper',
						'& .MuiDataGrid-columnHeader': { backgroundColor: 'background.paper' },
						cursor: 'pointer',
						'& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
							outline: 'red', // Prevent a cell outline when clicking on a cell.
						},
					}}
				/>
			</Paper> : <Info>
				<Translation id="noActiveStudents">The course does not have any active students at the moment. All students have their last activity a while ago.</Translation>
			</Info>}

			{areInactiveStudents ? <Par>
				<FormGroup>
					<FormControlLabel control={<Switch checked={filterInactive} onChange={event => setFilterInactive(event.target.checked)} sx={{ ml: 1 }} />} label={<Translation id="hideInactive">Hide inactive students</Translation>} />
				</FormGroup>
			</Par> : null}
		</TranslationGroup>
	</TranslationCatalog>
}
