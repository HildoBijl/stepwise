import { Condition, Translation, TranslationCatalog, TranslationGroup } from '@step-wise/i18n'

import { Head, Par } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'
import { CourseTranslation } from '../components/CourseTranslation'
import { CourseTeachers, CourseLearningGoals, UnsubscribeButton } from './components'

const translationSection = 'students'

export function CourseSettingsPageForStudent() {
	const { course } = useCourseData()
	return <>
		{course.description && <Par><CourseTranslation course={course} property="description" /></Par>}
		<UnsubscribeFromCourse course={course} />
		<CourseTeachers course={course} />
		<CourseLearningGoals course={course} />
	</>
}

function UnsubscribeFromCourse({ course }) {
	// For a teacherless organization, do not note the permissions.
	const organization = getOrganization(course.organization)
	return <>
		<TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
			<TranslationGroup path={translationSection}>
				<Head><Translation group={['students', 'unsubscribe']} id="title">Unsubscribe</Translation></Head>
				<Par><Translation group={['students', 'unsubscribe']} id="description"><Condition value={!!organization.noTeachers}><Condition.True>Unsubscribing from this course removes it from your course list. You can always resubscribe.</Condition.True><Condition.False>Unsubscribing from this course removes it from your course list. It also revokes permissions for the teachers of this course to view your progress within the course. You can always resubscribe to the course.</Condition.False></Condition></Translation></Par>
			</TranslationGroup>
		</TranslationCatalog>
		<UnsubscribeButton course={course} />
	</>
}
