import { useUser } from 'api'
import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Head, Par, LogInButtons } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

import { CourseTeachers, CourseLearningGoals, SubscribeButton } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = `students`

export function CourseSettingsPageForUnsubscribedUser() {
	const { course } = useCourseData()
	const user = useUser()

	return <>
		{course.description && <Par><Translation path="eduContent/courseInfo" entry={`${course.organization}.${course.code}.description`}>{course.description}</Translation></Par>}
		<SubscribeToCourse course={course} />
		{user ? <CourseTeachers course={course} /> : null}
		<CourseLearningGoals course={course} />
	</>
}

function SubscribeToCourse({ course }) {
	// If there is no user, show a sign-in form.
	const user = useUser()
	if (!user)
		return <>
			<TranslationFile path={translationPath}>
				<TranslationSection entry={translationSection}>
					<Head><Translation entry="subscribe.title">Subscribe</Translation></Head>
					<Par>You are currently not signed in.</Par>
					<LogInButtons centered={false} />
				</TranslationSection>
			</TranslationFile>
		</>

	// For a teacherless organization, do not note the permissions.
	const organization = getOrganization(course.organization)
	return <>
		<TranslationFile path={translationPath}>
			<TranslationSection entry={translationSection}>
				<Head><Translation entry="subscribe.title">Subscribe</Translation></Head>
				<Par><Translation entry="subscribe.description"><Check value={!!organization.noTeachers}><Check.True>Subscribing to this course adds it to your course list.</Check.True><Check.False>Subscribing to this course adds it to your course list. By subscribing, you grant permission to the (current and future) teachers of this course to view your progress within the course. You can always undo this by unsubscribing from the course.</Check.False></Check></Translation></Par>
			</TranslationSection>
		</TranslationFile>
		<SubscribeButton course={course} />
	</>
}
