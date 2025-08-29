import { useState, useMemo, useCallback } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import { HowToReg as SubscribeIcon } from '@material-ui/icons'

import { useLocalStorageState } from 'util'
import { usePromoteToTeacherMutation } from 'api'
import { TranslationFile, TranslationSection, Translation } from 'i18n'
import { Head, Par, Info, Warning, Term } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseForTeacher, CourseTeachers, UnsubscribeButton } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = 'teachers'

export function CourseSettingsPageForTeacher() {
	const course = useCourseForTeacher()
	return <>
		<StudentView course={course} />
		<AddTeacher course={course} />
		<Unsubscribe course={course} />
	</>
}

function StudentView({ course }) {
	const [studentView, setStudentView] = useLocalStorageState(`${course.code}StudentView`, false)
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={`${translationSection}.studentView`}>
			<Head><Translation entry="title">Student view</Translation></Head>
			<Par><Translation entry="description">In the student view you can see the course as if you are a student.</Translation></Par>
			<Par>
				<FormControlLabel control={<Switch checked={studentView} onChange={() => setStudentView(v => !v)} name="StudentView" color="primary" />} label={<Translation entry="label">Student view active</Translation>} />
			</Par>
			<Info><Translation entry="note">As a teacher, you also get the "Insert solution" button at exercises. Students don't have it!</Translation></Info>
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

	// Set up the handler to confirm the addition of the teacher.
	const [promoteToTeacher] = usePromoteToTeacherMutation(course.id)
	const addTeacher = useCallback(() => {
		setNewTeacher(newTeacher => {
			if (newTeacher)
				promoteToTeacher(newTeacher)
			return '' // Clear the dropdown list.
		})
	}, [setNewTeacher, promoteToTeacher])

	// Render the form.
	return <TranslationFile path={translationPath}>
		<TranslationSection entry={`${translationSection}.addTeacher`}>
			<FormControl variant="outlined" fullWidth className={classes.select}>
				<InputLabel id="newTeacherLabel"><Translation entry="label">Add a teacher</Translation></InputLabel>
				<Select labelId="newTeacherLabel" id="newTeacherSelect" value={newTeacher} label="New teacher" onChange={handleChange}>
					<MenuItem value=""><span style={{ opacity: 0.5 }}><Translation entry="noneSelected">None selected</Translation></span></MenuItem>
					{students && students.map(student => <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>)}
				</Select>
			</FormControl>
			{selectedStudent && <>
				<Warning style={{ margin: '0.25rem 0' }}><Translation entry="note">Adding a teacher will grant them access to the work and progress of all students within this course.</Translation></Warning>
				<Button variant="contained" color="primary"
					startIcon={<SubscribeIcon />} className={classes.button} onClick={addTeacher}><Translation entry="button">Add {{ name: selectedStudent.name }} as teacher</Translation></Button>
			</>}
		</TranslationSection>
	</TranslationFile>
}

function Unsubscribe({ course }) {
	return <>
		<TranslationFile path={translationPath}>
			<TranslationSection entry={`${translationSection}.unsubscribe`}>
				<Head><Translation entry="title">Unsubscribe</Translation></Head>
				<Par><Translation entry="description">By removing yourself from this course, you revoke your teacher access.</Translation></Par>
			</TranslationSection>
		</TranslationFile>
		<UnsubscribeButton course={course} />
	</>
}