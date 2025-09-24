import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { arraysToObject, keysToObject } from 'step-wise/util'
import { processSkillDataSet } from 'step-wise/skillTracking'
import { skillTree, includePrerequisitesAndLinks, processSkill, getDefaultSkillData, getCourseOverview } from 'step-wise/eduTools'

import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Par, List } from 'ui/components'
import { usePaths } from 'ui/routingTools'

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
	const overview = useMemo(() => getCourseOverview(course), [course])
	console.log(overview)
	const processedStudents = useProcessedStudents(students, overview.all)
	console.log(processedStudents)
	return <>
		<Par>The following students are currently subscribed in the course. Data on their progress will be added in the near future.</Par>
		<List items={students.map(student => <Fragment key={student.id}>{student.name}</Fragment>)} />
	</>
}

function useProcessedStudents(students, skillIds) {
	return useMemo(() => students.map(student => {
		// Filter out outdated none-existing skills, process the remaining skills, and turn them into an ID-keyed object (a raw dataset).
		const skillsProcessed = student.skills.filter(skill => skillTree[skill.skillId]).map(skill => processSkill(skill))
		const skillsAsObject = arraysToObject(skillsProcessed.map(skill => skill.skillId), skillsProcessed)

		// Add skills that are not in the data set. (These are skills that are not in the database yet.)
		const allSkillIds = includePrerequisitesAndLinks(skillIds)
		const skills = keysToObject(allSkillIds, skillId => skillsAsObject[skillId] || getDefaultSkillData(skillId))
		const skillDataSet = processSkillDataSet(skills, skillTree)

		// Return the resulting skill data set as property of the student.
		return { ...student, skillDataSet }
	}), [students, skillIds])
}
