import { useMemo, useRef } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { Alert, AlertTitle } from '@material-ui/lab'

import { count } from 'step-wise/util'
import { skillTree, processCourse, getSkillsBetween } from 'step-wise/eduTools'

import { useUser, useSkillsData, useMyCoursesQuery, useCreateCourseMutation } from 'api'
import { Translation, TranslationFile } from 'i18n'
import { Head, LoadingIndicator, ErrorNote } from 'ui/components'

import { getAnalysis } from './util'
import { Tile, AddCourseTile } from './Tile'

import { courses as hardcodedCourses } from './courses'

const translationPath = 'eduTools/pages/coursesPage'

const useStyles = makeStyles((theme) => ({
	courses: {
		display: 'grid',
		gap: '1rem',
		gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
		gridAutoRows: '8.5rem',
	},
}))

export function CoursesPage() {
	const myCoursesResult = useMyCoursesQuery()

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

	// Check if only one category is shown.
	if (teacherCourses.length === 0)
		return <StudentCourses courses={courses} />
	if (studentCourses.length === 0)
		return <TeacherCourses courses={courses} />

	// Render each of them separately. Put the one with the most courses first.
	if (studentCourses.length >= teacherCourses.length)
		return <>
			<StudentCourses courses={studentCourses} showHeader={true} />
			<TeacherCourses courses={teacherCourses} showHeader={true} />
		</>
	return <>
		<CourseAdditionCheck databaseCourses={courses} />
		<TeacherCourses courses={teacherCourses} showHeader={true} />
		<StudentCourses courses={studentCourses} showHeader={true} />
	</>
}

function StudentCourses({ courses, showHeader }) {
	return <>
		{showHeader && <Head><Translation path={translationPath} entry="studentCourses">Courses where you are a student</Translation></Head>}
		<CourseList courses={courses} showAddButton={true} />
	</>
}

function TeacherCourses({ courses, showHeader }) {
	return <>
		{showHeader && <Head><Translation path={translationPath} entry="teacherCourses">Courses where you are a teacher</Translation></Head>}
		<CourseList courses={courses} />
	</>
}

function CourseList({ courses, showAddButton }) {
	// Load all the skills data for the courses and use it to determine which skills need practice.
	const sortedCourses = useMemo(() => [...courses].sort((c1, c2) => new Date(c1.subscribedOn) - new Date(c2.subscribedOn)), [courses]) // Sort by subscription date, so that later courses come at the end.
	const processedCourses = useMemo(() => sortedCourses.map(rawCourse => processCourse(rawCourse)), [sortedCourses])
	const allSkills = [...new Set(processedCourses.map(processedCourse => processedCourse.all).flat())] // A list of all relevant skills for all courses.
	const skillsData = useSkillsData(allSkills) // The SkillData objects for all skills.
	const analyses = useMemo(() => processedCourses.map(processedCourse => getAnalysis(processedCourse, skillsData)), [processedCourses, skillsData])

	// Render all the tiles with corresponding data.
	const classes = useStyles()
	return <>
		<TranslationFile path={translationPath}>
			{sortedCourses.length > 0 ?
				<div className={clsx(classes.courses, 'courses')}>
					{sortedCourses.map((course, index) => <Tile
						key={course.id}
						course={course}
						skillsTotal={processedCourses[index].contents.length}
						skillsDone={analyses[index] ? count(processedCourses[index].contents, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
						recommendation={analyses[index]?.recommendation}
					/>)}
					{showAddButton && <AddCourseTile />}
				</div>
				:
				<>
					<Translation path={translationPath} entry="noSubscribedCourses">
						<Alert severity="info" style={{ marginBottom: '1rem' }}>
							<AlertTitle>You haven't subscribed to a course yet!</AlertTitle>
							Pick a course from the available list to start learning. No worries: it's all free and you can add/remove as many as you like.
						</Alert>
					</Translation>
					<div className={clsx(classes.courses, 'courses')}>
						{showAddButton && <AddCourseTile />}
					</div>
				</>}
		</TranslationFile >
	</>
}

// The CourseAdditionCheck is a temporary component to populate the database with courses, up until we have a tool that can actually create them live.
// ToDo: at some point this can be removed. In that case the courses.js file can also be removed accordingly.
function CourseAdditionCheck({ databaseCourses }) {
	const called = useRef()
	const [createCourseMutation] = useCreateCourseMutation()

	// Only call for admins.
	const user = useUser()
	if (user.role !== 'admin')
		return null

	// Only call the API once.
	if (called.current)
		return null
	called.current = true

	// Run it for all known courses.
	Object.values(hardcodedCourses).forEach(hardcodedCourse => {
		// If the course is already in the database, don't add it again.
		if (databaseCourses.find(databaseCourse => databaseCourse.code === hardcodedCourse.id))
			return

		// Set up the object to be sent to the API.
		const goals = hardcodedCourse.goals.map(goal => (typeof goal === 'string' ? goal : goal.skillId))
		const course = {
			code: hardcodedCourse.id,
			name: hardcodedCourse.name,
			description: hardcodedCourse.description,
			goals,
			startingPoints: getSkillsBetween(goals, hardcodedCourse.priorKnowledge).filter(skillId => skillTree[skillId].prerequisites.length === 0 || skillTree[skillId].prerequisites.some(prerequisiteId => hardcodedCourse.priorKnowledge.includes(prerequisiteId))),
			blocks: hardcodedCourse.blocks
		}
		const weights = hardcodedCourse.goals.map(goal => goal?.weight || 1)
		if (!weights.every(weight => weight === 1))
			course.goalWeights = weights
		if (hardcodedCourse.setup)
			course.setup = hardcodedCourse.setup.SO

		// Send the call to the API.
		createCourseMutation(course)
	})
}
