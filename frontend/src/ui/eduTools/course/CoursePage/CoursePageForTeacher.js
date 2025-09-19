import { Fragment, useMemo } from 'react'
import { Link } from 'react-router-dom'

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
	return <StudentOverview students={students} />
}

function StudentOverview({ students }) {
	students = useMemo(() => [...students].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })), [students])
	return <>
		<Par>The following students are currently subscribed in the course. Data on their progress will be added in the near future.</Par>
		<List items={students.map(student => <Fragment key={student.id}>{student.name}</Fragment>)} />
	</>
}
