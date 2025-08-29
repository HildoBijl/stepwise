import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Head, Par } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'
import { CourseTeachers, CourseLearningGoals, UnsubscribeButton } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = 'students'

export function CourseSettingsPageForStudent() {
	const { course } = useCourseData()
	return <>
		{course.description && <Par><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation></Par>}
		<UnsubscribeFromCourse course={course} />
		<CourseTeachers course={course} />
		<CourseLearningGoals course={course} />
	</>
}

function UnsubscribeFromCourse({ course }) {
	// For a teacherless organization, do not note the permissions.
	const organization = getOrganization(course.organization)
	return <>
		<TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Head><Translation entry="unsubscribe.title">Unsubscribe</Translation></Head>
				<Par><Translation entry="unsubscribe.description"><Check value={!!organization.noTeachers}><Check.True>Unsubscribing from this course removes it from your course list. You can always resubscribe.</Check.True><Check.False>Unsubscribing from this course removes it from your course list. It also revokes permissions for the teachers of this course to view your progress within the course. You can always resubscribe to the course.</Check.False></Check></Translation></Par>
			</TranslationSection>
		</TranslationFile>
		<UnsubscribeButton course={course} />
	</>
}
