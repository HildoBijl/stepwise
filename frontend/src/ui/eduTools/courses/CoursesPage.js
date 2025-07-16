import React, { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { count } from 'step-wise/util'
import { processCourse } from 'step-wise/eduTools'

import { useSkillsData, useMyCoursesQuery } from 'api'
import { TranslationFile } from 'i18n'

import { getAnalysis } from './util'
import { Tile } from './Tile'

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
	if (myCoursesResult.loading)
		return <p>Loading courses...</p> // ToDo: translate.
	if (myCoursesResult.error)
		return <p>Failed to load courses. Check your connection?</p> // ToDo: translate.
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
		<TranslationFile path="eduTools/pages/coursesPage">
			<div className={clsx(classes.courses, 'courses')}>
				{courses.map((course, index) => <Tile
					key={course.id}
					course={course}
					skillsTotal={processedCourses[index].contents.length}
					skillsDone={analyses[index] ? count(processedCourses[index].contents, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
					recommendation={analyses[index]?.recommendation}
				/>)}
			</div>
		</TranslationFile>
	)
}
