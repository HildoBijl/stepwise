import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'

import { skillTree } from 'step-wise/eduTools'

import { useSubscribeToCourseMutation } from 'api'
import { TranslationFile, Translation, Check, Plurals, WordList } from 'i18n'
import { Head, Par, List } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

const translationPath = `eduTools/pages/coursePage`

export function CoursePageForUnsubscribedUser() {
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
		<Head><Translation entry="subscribe.title">Subscribe</Translation></Head>
		<Par><Translation entry="subscribe.description"><Check value={!!organization.noTeachers}><Check.True>Subscribing to this course adds it to your course list.</Check.True><Check.False>Subscribing to this course adds it to your course list. By subscribing, you grant permission to the (current and future) teachers of this course to view your progress within the course. You can always undo this by unsubscribing from the course.</Check.False></Check></Translation></Par>
		<SubscribeButton course={course} />
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

export function CourseTeachers({ course }) {
	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	if (organization.noTeachers)
		return

	// Show the teachers.
	const { teachers } = course
	return <TranslationFile path={translationPath}>
		<Head><Translation entry="teachers.title">Teachers</Translation></Head>
		<Par><Translation entry="teachers.description"><Plurals value={teachers.length}><Plurals.Zero>This course has no teachers at the moment.</Plurals.Zero><Plurals.NotZero>This course is taught by <WordList words={teachers.map(teacher => <strong key={teacher.id}>{teacher.name}</strong>)} />.</Plurals.NotZero></Plurals></Translation></Par>
	</TranslationFile>
}

export function CourseLearningGoals({ course }) {
	const paths = usePaths()
	return <TranslationFile path={translationPath}>
		<Head><Translation entry="learningGoals.title">Learning goals</Translation></Head>
		<Par><Translation entry="learningGoals.description">The course has the following final <Plurals value={course.goals.length}><Plurals.One>goal</Plurals.One><Plurals.NotOne>goals</Plurals.NotOne></Plurals>.</Translation></Par>
		<List items={course.goals.map(goalId => {
			const skill = skillTree[goalId]
			return <Link to={paths.skill({ skillId: goalId })}><Translation path="eduContent/skillNames" entry={`${skill.path.join('.')}.${skill.id}`}>{skill.name}</Translation></Link>
		})} />
	</TranslationFile>
}
