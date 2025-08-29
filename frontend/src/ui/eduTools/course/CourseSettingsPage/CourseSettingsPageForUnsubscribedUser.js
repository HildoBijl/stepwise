import Button from '@material-ui/core/Button'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'

import { useSubscribeToCourseMutation } from 'api'
import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Head, Par } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

import { CourseTeachers, CourseLearningGoals } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = `students`

export function CourseSettingsPageForUnsubscribedUser() {
	const { course } = useCourseData()
	return <>
		{course.description && <Par><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation></Par>}
		<SubscribeToCourse course={course} />
		<CourseTeachers course={course} />
		<CourseLearningGoals course={course} />
	</>
}

function SubscribeToCourse({ course }) {
	// For a teacherless organization, do not note the permissions.
	const organization = getOrganization(course.organization)
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation entry="subscribe.title">Subscribe</Translation></Head>
			<Par><Translation entry="subscribe.description"><Check value={!!organization.noTeachers}><Check.True>Subscribing to this course adds it to your course list.</Check.True><Check.False>Subscribing to this course adds it to your course list. By subscribing, you grant permission to the (current and future) teachers of this course to view your progress within the course. You can always undo this by unsubscribing from the course.</Check.False></Check></Translation></Par>
			<SubscribeButton course={course} />
		</TranslationSection>
	</TranslationFile>
}

function SubscribeButton({ course }) {
	const [subscribeToCourse] = useSubscribeToCourseMutation()
	return <>
		<Button variant="contained" startIcon={<SubscribeIcon />} onClick={() => subscribeToCourse(course.id)} color="primary" style={{ marginTop: '0.2rem', marginBottom: '0.6rem' }}>
			<Translation entry="subscribe.button">Subscribe to this course</Translation>
		</Button>
	</>
}
