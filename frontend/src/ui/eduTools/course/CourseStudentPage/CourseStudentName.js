import { useParams } from 'react-router-dom'

import { TitleItem } from 'ui/routingTools'

import { useCourseData } from '../components'

export function CourseStudentName() {
	// Find the student from the course data.
	const { studentId } = useParams()
	const { course } = useCourseData()
	const student = course && course.students.find(student => student.id === studentId)

	// Render the student's name as the page title.
	if (!student)
		return <TitleItem folder={['eduTools', 'pages']} catalog="courseStudentPage" group={[]} id="unknownStudentTitle" name="Unknown student" />
	return <TitleItem name={student.name} />
}
