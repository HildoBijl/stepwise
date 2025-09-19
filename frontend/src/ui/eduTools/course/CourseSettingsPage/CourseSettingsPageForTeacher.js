import { useState, useMemo, useCallback } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Button, FormControlLabel, Switch } from '@mui/material'
import { HowToReg as SubscribeIcon } from '@mui/icons-material'

import { useLocalStorageState } from 'util'
import { usePromoteToTeacherMutation, useIsAdmin } from 'api'
import { TranslationFile, TranslationSection, Translation, Check } from 'i18n'
import { Head, Par, Info, Warning } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

import { CourseTeachers, SubscribeButton, UnsubscribeButton } from './components'

const translationPath = `eduTools/pages/courseSettingsPage`
const translationSection = 'teachers'

export function CourseSettingsPageForTeacher() {
	const { course } = useCourseData()
	return <>
		<StudentView course={course} />
		<AddTeacher course={course} />
		<Unsubscribe course={course} />
		<AdminSubscribe course={course} />
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

function AddTeacherForm({ course }) {
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
			<FormControl variant="outlined" fullWidth sx={{ my: 1 }}>
				<InputLabel id="newTeacherLabel"><Translation entry="label">Add a teacher</Translation></InputLabel>
				<Select labelId="newTeacherLabel" id="newTeacherSelect" value={newTeacher} label="New teacher" onChange={handleChange}>
					<MenuItem value=""><span style={{ opacity: 0.5 }}><Translation entry="noneSelected">None selected</Translation></span></MenuItem>
					{students && students.map(student => <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>)}
				</Select>
			</FormControl>
			{selectedStudent && <>
				<Warning style={{ margin: '0.25rem 0' }}><Translation entry="note">Adding a teacher will grant them access to the work and progress of all students within this course.</Translation></Warning>
				<Button variant="contained" color="primary" startIcon={<SubscribeIcon />} onClick={addTeacher} sx={{ my: 1 }}><Translation entry="button">Add {{ name: selectedStudent.name }} as teacher</Translation></Button>
			</>}
		</TranslationSection>
	</TranslationFile>
}

function Unsubscribe({ course }) {
	// If the user does not have a role, then it's an external (probably an admin) peeking in. Don't show an unsubscribe then.
	if (!course.role)
		return null
	return <>
		<TranslationFile path={translationPath}>
			<TranslationSection entry={`${translationSection}.unsubscribe`}>
				<Head><Translation entry="title">Unsubscribe</Translation></Head>
				<Par><Translation entry="description"><Check value={course.role === 'teacher'}><Check.True>By removing yourself from this course, you revoke your teacher access.</Check.True><Check.False>You are a student in this course, but you see this teacher page due to your admin rights. You can unsubscribe as a student from this course.</Check.False></Check></Translation></Par>
			</TranslationSection>
		</TranslationFile>
		<UnsubscribeButton course={course} />
	</>
}

function AdminSubscribe({ course }) {
	// If the user has a role, then it's already subscribed. Don't show the subscribe. Similarly for non-admins (should not occur).
	const isAdmin = useIsAdmin()
	if (course.role || !isAdmin)
		return null
	return <>
		<TranslationFile path={translationPath}>
			<TranslationSection entry={`${translationSection}.adminSubscribe`}>
				<Head><Translation entry="title">Subscribe</Translation></Head>
				<Par><Translation entry="description">You're currently not a part of this course, but you are using your admin rights to peek in. Want to formally subscribe? Do so here.</Translation></Par>
			</TranslationSection>
		</TranslationFile>
		<SubscribeButton course={course} />
	</>
}
