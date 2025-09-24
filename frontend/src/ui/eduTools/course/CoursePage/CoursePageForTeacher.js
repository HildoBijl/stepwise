import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'

import { count, arraysToObject, keysToObject } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData, getCourseOverview } from 'step-wise/eduTools'

import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Par } from 'ui/components'
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
	// Check out the course and define columns based on it.
	const overview = useMemo(() => getCourseOverview(course), [course])
	console.log(overview)
	const { blocks } = overview
	const dgColumns = useMemo(() => [
		{ field: 'name', headerName: 'Name', width: 150, align: 'left', headerAlign: 'left' },
		{ field: 'total', headerName: 'Total', width: 80, align: 'center', headerAlign: 'center' },
		...blocks.map((block, index) => ({ field: `block${index}`, headerName: `${index + 1}`, width: 80, align: 'center', headerAlign: 'center' })),
	], [blocks])

	// Process the student data and set up rows based on it.
	const processedStudents = useProcessedStudents(students, overview)
	const dgRows = useMemo(() => processedStudents.map(student => {
		return {
			id: student.id,
			name: student.name,
			total: student.numCompleted,
			...arraysToObject(blocks.map((_, index) => `block${index}`), blocks.map((block, index) => student.numCompletedPerBlock[index])),
		}
	}), [processedStudents, blocks])

	return <DataGrid
		rows={dgRows}
		columns={dgColumns}
		initialState={{
			sorting: { sortModel: [{ field: 'name', sort: 'asc' }] },
		}}
		disableColumnMenu
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
