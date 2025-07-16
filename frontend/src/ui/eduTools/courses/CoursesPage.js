import React, { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import { Alert, AlertTitle } from '@material-ui/lab'

import { count } from 'step-wise/util'
import { processCourse } from 'step-wise/eduTools'

import { useSkillsData, useMyCoursesQuery } from 'api'
import { Translation, TranslationFile } from 'i18n'

import { getAnalysis } from './util'
import { Tile } from './Tile'

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
		return <Translation path={translationPath} entry="loadingCourses">
			<Alert severity="info">
				<AlertTitle>Loading courses...</AlertTitle>
				We are loading your courses from the database. This shouldn't take long.
			</Alert>
		</Translation>
	if (myCoursesResult.error)
		return <Translation path={translationPath} entry="failedLoadingCourses">
			<Alert severity="error">
				<AlertTitle>Loading courses failed</AlertTitle>
				Oops ... something went wrong loading your courses. Maybe it's your connection? Maybe our server is down? We're not sure! Either way, try refreshing the page, and otherwise try again later.
			</Alert>
		</Translation>

	// When we have the data, render it accordingly.
	const myCourses = myCoursesResult.data.myCourses
	return <CoursePageForCourses courses={myCourses} />
}

function CoursePageForCourses({ courses }) {
	// // Load all the skills data for the courses and use it to determine which skills need practice.
	const processedCourses = useMemo(() => courses.map(rawCourse => processCourse(rawCourse)), [courses])
	const allSkills = [...new Set(processedCourses.map(processedCourse => processedCourse.all).flat())] // A list of all relevant skills for all courses.
	const skillsData = useSkillsData(allSkills) // The SkillData objects for all skills.
	const analyses = useMemo(() => processedCourses.map(processedCourse => getAnalysis(processedCourse, skillsData)), [processedCourses, skillsData])

	// Render all the tiles with corresponding data.
	const classes = useStyles()
	return (
		<TranslationFile path={translationPath}>
			{courses.length > 0 ?
				<div className={clsx(classes.courses, 'courses')}>
					{courses.map((course, index) => <Tile
						key={course.id}
						course={course}
						skillsTotal={processedCourses[index].contents.length}
						skillsDone={analyses[index] ? count(processedCourses[index].contents, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
						recommendation={analyses[index]?.recommendation}
					/>)}
				</div>
				:
				<Translation path={translationPath} entry="noSubscribedCourses">
					<Alert severity="info">
						<AlertTitle>You haven't subscribed to a course yet!</AlertTitle>
						Pick a course from the available list to start learning. No worries: it's all free and you can add/remove as many as you like.
					</Alert>
				</Translation>}
		</TranslationFile>
	)
}
