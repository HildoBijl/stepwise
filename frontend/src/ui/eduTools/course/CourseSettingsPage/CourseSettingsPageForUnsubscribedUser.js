import { useUser } from 'api'
import { Condition, Translation, TranslationCatalog, TranslationGroup } from '@step-wise/i18n'

import { Head, Par, SignInButtons } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'
import { CourseTranslation } from '../components/CourseTranslation'

import { CourseTeachers, CourseLearningGoals, SubscribeButton } from './components'

const translationSection = `students`

export function CourseSettingsPageForUnsubscribedUser() {
	const { course } = useCourseData()
	const user = useUser()

	return <>
		{course.description && <Par><CourseTranslation course={course} property="description" /></Par>}
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
			<TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
				<TranslationGroup path={translationSection}>
					<Head><Translation group={['students', 'subscribe']} id="title">Subscribe</Translation></Head>
					<Par>You are currently not signed in.</Par>
					<SignInButtons centered={false} />
				</TranslationGroup>
			</TranslationCatalog>
		</>

	// For a teacherless organization, do not note the permissions.
	const organization = getOrganization(course.organization)
	return <>
		<TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
			<TranslationGroup path={translationSection}>
				<Head><Translation group={['students', 'subscribe']} id="title">Subscribe</Translation></Head>
				<Par><Translation group={['students', 'subscribe']} id="description"><Condition value={!!organization.noTeachers}><Condition.True>Subscribing to this course adds it to your course list.</Condition.True><Condition.False>Subscribing to this course adds it to your course list. By subscribing, you grant permission to the (current and future) teachers of this course to view your progress within the course. You can always undo this by unsubscribing from the course.</Condition.False></Condition></Translation></Par>
			</TranslationGroup>
		</TranslationCatalog>
		<SubscribeButton course={course} />
	</>
}
