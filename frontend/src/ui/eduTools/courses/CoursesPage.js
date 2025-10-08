import { useMemo } from 'react'
import { Alert, AlertTitle, Box } from '@mui/material'

import { count } from 'step-wise/util'
import { processCourse } from 'step-wise/eduTools'

import { useSkillsData, useMyCoursesQuery } from 'api'
import { Translation, TranslationFile } from 'i18n'
import { Head, LoadingIndicator, ErrorNote } from 'ui/components'

import { getAnalysis } from './util'
import { StudentTile, TeacherTile, AddCourseTile } from './Tile'

const translationPath = 'eduTools/pages/coursesPage'

export function CoursesPage() {
	const myCoursesResult = useMyCoursesQuery(true, true)

	// When we don't have the data, show a relevant indication of what's going on.
	if (myCoursesResult.loading)
		return <LoadingIndicator />
	if (myCoursesResult.error)
		return <ErrorNote />

	// When we have the data, render it accordingly.
	const myCourses = myCoursesResult.data.myCourses
	return <CoursePageForCourses courses={myCourses} />
}

function CoursePageForCourses({ courses }) {
	// Split the courses based on teacher and student roles.
	const studentCourses = useMemo(() => courses.filter(course => course.role === 'student'), [courses])
	const teacherCourses = useMemo(() => courses.filter(course => course.role === 'teacher'), [courses])

	// If there are no teacher courses, only show student courses.
	if (teacherCourses.length === 0)
		return <StudentCourses courses={courses} />

	// Render each of them separately. Put the one with the most courses first.
	if (studentCourses.length >= teacherCourses.length)
		return <>
			<StudentCourses courses={studentCourses} showHeader={true} />
			<TeacherCourses courses={teacherCourses} showHeader={true} />
		</>
	return <>
		<TeacherCourses courses={teacherCourses} showHeader={true} />
		<StudentCourses courses={studentCourses} showHeader={true} />
	</>
}

function StudentCourses({ courses, showHeader }) {
	return <>
		{showHeader && <Head><Translation path={translationPath} entry="studentCourses">Courses where you are a student</Translation></Head>}
		<StudentCourseList courses={courses} showAddButton={true} />
	</>
}

function TeacherCourses({ courses, showHeader }) {
	if (courses.length === 0)
		return null
	return <>
		{showHeader && <Head><Translation path={translationPath} entry="teacherCourses">Courses where you are a teacher</Translation></Head>}
		<TeacherCourseList courses={courses} />
	</>
}

// Define the style for tile lists.
const coursesStyle = {
	display: 'grid',
	gap: '1rem',
	gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
	gridAutoRows: '8.5rem',
}

function StudentCourseList({ courses, showAddButton }) {
	// Load all the skills data for the courses and use it to determine which skills need practice.
	const sortedCourses = useMemo(() => [...courses].sort((c1, c2) => new Date(c1.subscribedOn) - new Date(c2.subscribedOn)), [courses]) // Sort by subscription date, so that later courses come at the end.
	const processedCourses = useMemo(() => sortedCourses.map(rawCourse => processCourse(rawCourse)), [sortedCourses])
	const allSkills = [...new Set(processedCourses.map(processedCourse => processedCourse.all).flat())] // A list of all relevant skills for all courses.
	const skillsData = useSkillsData(allSkills) // The SkillData objects for all skills.
	const analyses = useMemo(() => processedCourses.map(processedCourse => getAnalysis(processedCourse, skillsData)), [processedCourses, skillsData])

	// Render all the tiles with corresponding data.
	return <TranslationFile path={translationPath}>
		{sortedCourses.length > 0 ?
			<Box sx={coursesStyle}>
				{sortedCourses.map((course, index) => <StudentTile
					key={course.id}
					course={course}
					skillsTotal={processedCourses[index].contents.length}
					skillsDone={analyses[index] ? count(processedCourses[index].contents, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
					recommendation={analyses[index]?.recommendation}
				/>)}
				{showAddButton && <AddCourseTile />}
			</Box>
			:
			<>
				<Translation path={translationPath} entry="noSubscribedCourses">
					<Alert severity="info" sx={{ mb: 2 }}>
						<AlertTitle>You haven't subscribed to a course yet!</AlertTitle>
						Pick a course from the available list to start learning. No worries: it's all free and you can add/remove as many as you like.
					</Alert>
				</Translation>
				<Box sx={coursesStyle}>
					{showAddButton && <AddCourseTile />}
				</Box>
			</>}
	</TranslationFile>
}

function TeacherCourseList({ courses }) {
	// Load all the skills data for the courses and use it to determine which skills need practice.
	const sortedCourses = useMemo(() => [...courses].sort((c1, c2) => new Date(c1.subscribedOn) - new Date(c2.subscribedOn)), [courses]) // Sort by subscription date, so that later courses come at the end.

	return <TranslationFile path={translationPath}>
		<Box sx={coursesStyle}>
			{sortedCourses.map(course => <TeacherTile
				key={course.id}
				course={course}
			/>)}
		</Box>
	</TranslationFile>
}
