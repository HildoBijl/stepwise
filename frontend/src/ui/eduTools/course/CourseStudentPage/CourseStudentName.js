import { useParams } from 'react-router-dom'
import { TranslationCatalog, TranslationFolder, TranslationGroup } from '@step-wise/i18n'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from '../components'

export function CourseStudentName() {
	// Find the student from the course data.
	const { studentId } = useParams()
	const { course } = useCourseData()
	const student = course && course.students.find(student => student.id === studentId)

	// Render the student's name as the page title.
	if (!student)
		return <TranslationFolder path={['eduTools', 'pages']}><TranslationCatalog name="courseStudentPage"><TranslationGroup path={[]}><TitleItem id="unknownStudentTitle" name="Unknown student" /></TranslationGroup></TranslationCatalog></TranslationFolder>
	return <TitleItem name={student.name} />
}
