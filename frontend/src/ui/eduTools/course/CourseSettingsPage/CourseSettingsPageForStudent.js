import Button from '@material-ui/core/Button'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'

import { useUnsubscribeFromCourseMutation } from 'api'
import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Head, Par } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'
import { CourseTeachers, CourseLearningGoals } from './components'

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
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation entry="unsubscribe.title">Unsubscribe</Translation></Head>
			<Par><Translation entry="unsubscribe.description"><Check value={!!organization.noTeachers}><Check.True>Unsubscribing from this course removes it from your course list. You can always resubscribe.</Check.True><Check.False>Unsubscribing from this course removes it from your course list. It also revokes permissions for the teachers of this course to view your progress within the course. You can always resubscribe to the course.</Check.False></Check></Translation></Par>
			<UnsubscribeButton course={course} />
		</TranslationSection>
	</TranslationFile>
}

function UnsubscribeButton({ course }) {
	const [unsubscribeFromCourse] = useUnsubscribeFromCourseMutation()
	return <>
		<Button variant="contained" startIcon={<SubscribeIcon />} onClick={() => unsubscribeFromCourse(course.id)} color="secondary" style={{ marginTop: '0.2rem', marginBottom: '0.6rem' }}>
			<Translation entry="unsubscribe.button">Unsubscribe from this course</Translation>
		</Button>
	</>
}
