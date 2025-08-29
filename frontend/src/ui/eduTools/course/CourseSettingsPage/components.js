import { Link } from 'react-router-dom'

import { skillTree } from 'step-wise/eduTools'

import { useCourseForTeacherQuery } from 'api'
import { TranslationFile, TranslationSection, Translation, Plurals, WordList } from 'i18n'
import { Head, Par, List } from 'ui/components'
import { usePaths } from 'ui/routingTools'

import { useCourseData } from '../components'

import { getOrganization } from '../../organizations'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = `students`

export function useCourseForTeacher() {
	const { course: courseForStudent } = useCourseData() // The course without students has already been loaded (cached).
	const { data } = useCourseForTeacherQuery(courseForStudent.code) // Load the course with the students.
	return data?.courseForTeacher || courseForStudent // If the course for teachers is available, return it. Otherwise for now return the course without students.
}

export function CourseTeachers({ course }) {
	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	if (organization.noTeachers)
		return

	// Show the teachers.
	const { teachers } = course
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation entry="teachers.title">Teachers</Translation></Head>
			<Par><Translation entry="teachers.description"><Plurals value={teachers.length}><Plurals.Zero>This course has no teachers at the moment.</Plurals.Zero><Plurals.NotZero>This course is taught by <WordList words={teachers.map(teacher => <strong key={teacher.id}>{teacher.name}</strong>)} />.</Plurals.NotZero></Plurals></Translation></Par>
		</TranslationSection>
	</TranslationFile>
}

export function CourseLearningGoals({ course }) {
	const paths = usePaths()
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head><Translation entry="learningGoals.title">Learning goals</Translation></Head>
			<Par><Translation entry="learningGoals.description">The course has the following final <Plurals value={course.goals.length}><Plurals.One>goal</Plurals.One><Plurals.NotOne>goals</Plurals.NotOne></Plurals>.</Translation></Par>
			<List items={course.goals.map(goalId => {
				const skill = skillTree[goalId]
				return <Link to={paths.skill({ skillId: goalId })}><Translation path="eduContent/skillNames" entry={`${skill.path.join('.')}.${skill.id}`}>{skill.name}</Translation></Link>
			})} />
		</TranslationSection>
	</TranslationFile>
}
