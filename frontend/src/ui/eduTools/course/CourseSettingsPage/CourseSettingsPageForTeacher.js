import { useState, useMemo, useCallback } from 'react'
import { FormControl, InputLabel, MenuItem, Select, Button, FormControlLabel, Switch } from '@mui/material'
import { HowToReg as SubscribeIcon } from '@mui/icons-material'

import { useLocalStorageState } from '@step-wise/react-utils'
import { Condition, Translation, TranslationCatalog, TranslationGroup } from '@step-wise/i18n'

import { usePromoteToTeacher, useIsAdmin } from 'api'

import { Head, Par, Info, Warning, ErrorNote } from 'ui/components'

import { getOrganization } from '../../organizations'

import { useCourseData } from '../components'

import { CourseTeachers, SubscribeButton, UnsubscribeButton } from './components'

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
	return <TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
		<TranslationGroup path={[translationSection, 'studentView']}>
			<Head><Translation id="title">Student view</Translation></Head>
			<Par><Translation id="description">In the student view you can see the course as if you are a student.</Translation></Par>
			<Par>
				<FormControlLabel control={<Switch checked={studentView} onChange={() => setStudentView(v => !v)} name="StudentView" color="primary" />} label={<Translation id="label">Student view active</Translation>} />
			</Par>
			<Info><Translation id="note">As a teacher, you also get the "Insert solution" button at exercises. Students don't have it!</Translation></Info>
		</TranslationGroup>
	</TranslationCatalog>
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
	const [promoteToTeacher, { loading, error }] = usePromoteToTeacher(course.id)
	const addTeacher = useCallback(async () => {
		if (!newTeacher) return
		try {
			await promoteToTeacher(newTeacher)
			setNewTeacher('')
		} catch {}
	}, [newTeacher, promoteToTeacher])

	// Render the form.
	return <TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
		<TranslationGroup path={[translationSection, 'addTeacher']}>
			<FormControl variant="outlined" fullWidth sx={{ my: 1 }}>
				<InputLabel id="newTeacherLabel"><Translation id="label">Add a teacher</Translation></InputLabel>
				<Select labelId="newTeacherLabel" id="newTeacherSelect" value={newTeacher} label="New teacher" onChange={handleChange} sx={{
					backgroundColor: '#fbfbfb',
					"&:focus": {
						backgroundColor: '#fbfbfb',
					},
				}}>
					<MenuItem value=""><span style={{ opacity: 0.5 }}><Translation id="noneSelected">None selected</Translation></span></MenuItem>
					{students && students.map(student => <MenuItem key={student.id} value={student.id}>{student.name} &lt;{student.email}&gt;</MenuItem>)}
				</Select>
			</FormControl>
			{selectedStudent && <>
				<Warning style={{ margin: '0.25rem 0' }}><Translation id="note">Adding a teacher will grant them access to the work and progress of all students within this course.</Translation></Warning>
				<Button variant="contained" color="primary" startIcon={<SubscribeIcon />} onClick={addTeacher} disabled={loading} sx={{ my: 1 }}><Translation id="button">Add {{ name: selectedStudent.name }} as teacher</Translation></Button>
			</>}
			{error && <ErrorNote error={error} />}
		</TranslationGroup>
	</TranslationCatalog>
}

function Unsubscribe({ course }) {
	// If the user does not have a role, then it's an external (probably an admin) peeking in. Don't show an unsubscribe then.
	if (!course.subscription)
		return null
	return <>
		<TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
			<TranslationGroup path={[translationSection, 'unsubscribe']}>
				<Head><Translation id="title">Unsubscribe</Translation></Head>
				<Par><Translation id="description"><Condition value={course.subscription.role === 'teacher'}><Condition.True>By removing yourself from this course, you revoke your teacher access.</Condition.True><Condition.False>You are a student in this course, but you see this teacher page due to your admin rights. You can unsubscribe as a student from this course.</Condition.False></Condition></Translation></Par>
			</TranslationGroup>
		</TranslationCatalog>
		<UnsubscribeButton course={course} />
	</>
}

function AdminSubscribe({ course }) {
	// If the user has a role, then it's already subscribed. Don't show the subscribe. Similarly for non-admins (should not occur).
	const isAdmin = useIsAdmin()
	if (course.subscription || !isAdmin)
		return null
	return <>
		<TranslationCatalog folder={['eduTools', 'pages']} name="courseSettingsPage">
			<TranslationGroup path={[translationSection, 'adminSubscribe']}>
				<Head><Translation id="title">Subscribe</Translation></Head>
				<Par><Translation id="description">You're currently not a part of this course, but you are using your admin rights to peek in. Want to formally subscribe? Do so here.</Translation></Par>
			</TranslationGroup>
		</TranslationCatalog>
		<SubscribeButton course={course} />
	</>
}
