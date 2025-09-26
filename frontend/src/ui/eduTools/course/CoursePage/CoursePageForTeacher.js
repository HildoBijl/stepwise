import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Box, Paper, Tooltip, FormGroup, FormControlLabel, Switch } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

import { arraysToObject } from 'step-wise/util'
import { getCourseOverview } from 'step-wise/eduTools'

import { useLocalStorageState } from 'util'
import { TranslationFile, TranslationSection, Translation, useTranslator } from 'i18n'
import { notSelectable } from 'ui/theme'
import { Par, TimeAgo } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { processStudent } from '../../courses'

import { useCourseData, CenteredProgressIndicator } from '../components'

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
	const navigate = useNavigate()
	const paths = usePaths()

	// Check out the course and define columns based on it.
	const overview = useMemo(() => getCourseOverview(course), [course])
	const { blocks } = overview
	const renderHeader = cell => <Box component="span" sx={{ fontWeight: 500, ...notSelectable }}>{cell.colDef.headerName}</Box>
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
	let processedStudents = useMemo(() => students.map(student => processStudent(student, overview)), [students, overview])
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
			all: student.numCompleted,
			...arraysToObject(blocks.map((_, index) => `block${index}`), blocks.map((block, index) => student.numCompletedPerBlock[index])),
		}
	}), [processedStudents, blocks])

	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Paper elevation={3}>
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
			</Paper>

			{areInactiveStudents ? <Par>
				<FormGroup>
					<FormControlLabel control={<Switch checked={filterInactive} onChange={event => setFilterInactive(event.target.checked)} sx={{ ml: 1 }} />} label={<Translation entry="hideInactive">Hide inactive students</Translation>} />
				</FormGroup>
			</Par> : null}
		</TranslationSection>
	</TranslationFile>
}
