import { TranslationFile, TranslationSection } from 'i18n'
import { Head, Par, Info, Term } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

import { CourseTeachers } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = 'teachers'

export function CourseSettingsPageForTeacher() {
	const { course } = useCourseData()
	console.log(course)

	return <>
		<StudentView course={course} />
		<CourseTeachers course={course} />
		<AddTeacher course={course} />
		<Unregister course={course} />
	</>
}

function StudentView({ course }) {
	// ToDo: add student view.
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head>Student view</Head>
			<Par>Turn on the <Term>student view</Term> to see this course as if you are a student.</Par>
			<Par>(This functionality is still being developed. Expected release is late September 2025.)</Par>
			<Info>As a teacher, you get the bonus of having a "Solve exercise" button. Students of course don't have this one!</Info>
		</TranslationSection>
	</TranslationFile>
}

function AddTeacher({ course }) {
	// A course without teachers should not display them.
	const organization = getOrganization(course.organization)
	if (organization.noTeachers)
		return

	// ToDo
	return <Par>ToDo: add an add course teacher option.</Par>
}

function Unregister({ course }) {
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={translationSection}>
			<Head>Unregister from this course</Head>
			<Par>You can fully remove yourself from this course. This will revoke your teacher access. The only way to get this back is for another teacher to add you again.</Par>
			<Par>ToDo: add resign option.</Par>
		</TranslationSection>
	</TranslationFile>
}