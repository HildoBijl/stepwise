import { useState, useMemo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'

import { TranslationFile, TranslationSection } from 'i18n'
import { Head, Par, Info, Term } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseForTeacher, CourseTeachers } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = 'teachers'

export function CourseSettingsPageForTeacher() {
	const course = useCourseForTeacher()
	return <>
		<StudentView course={course} />
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

	// Render the current teachers and a form to add one.
	return <>
		<CourseTeachers course={course} />
		<AddTeacherForm course={course} />
	</>
}

const useStyles = makeStyles((theme) => ({
	select: {
		marginBottom: theme.spacing(1),
		marginTop: theme.spacing(1),
	},
	button: {
		marginBottom: theme.spacing(1),
		marginTop: theme.spacing(1),
	},
}))

function AddTeacherForm({ course }) {
	const classes = useStyles()

	// Sort the students by their name.
	const { students: studentsRaw } = course
	const students = useMemo(() => studentsRaw && [...studentsRaw].sort((a, b) => a.name.localeCompare(b.name)), [studentsRaw])

	// Set up handlers for the dropdown list.
	const [newTeacher, setNewTeacher] = useState('')
	const handleChange = (event) => setNewTeacher(event.target.value)
	const selectedStudent = newTeacher && students.find(student => student.id === newTeacher)

	// Render the form.
	return <>
		<Par>You can add a new teacher to this course. Note that this will grant the teacher access to the work and progress of all students within this course.</Par>
		<FormControl variant="outlined" fullWidth className={classes.select}>
			<InputLabel id="newTeacherLabel">New teacher</InputLabel>
			<Select labelId="newTeacherLabel" id="newTeacherSelect" value={newTeacher} label="New teacher" onChange={handleChange}>
				<MenuItem value=""><span style={{ opacity: 0.5 }}>None selected</span></MenuItem>
				{students && students.map(student => <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>)}
			</Select>
		</FormControl>
		{selectedStudent ? <Button variant="contained" color="primary"
			startIcon={<SubscribeIcon />} className={classes.button}>Add {selectedStudent.name} as teacher to this course</Button> : null}
	</>
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