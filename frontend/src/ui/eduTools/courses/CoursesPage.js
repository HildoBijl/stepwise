import React, { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { count } from 'step-wise/util'

import { useSkillsData } from 'api/skill'
import { TranslationFile, useLanguage } from 'i18n'

import { getOverview, getAnalysis } from './util'

import { courses } from './courses'
import { Tile } from './Tile'

const courseOverviews = Object.values(courses).map(getOverview)

const useStyles = makeStyles((theme) => ({
	courses: {
		display: 'grid',
		gap: '1rem',
		gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
		gridAutoRows: '8.5rem',
	},
}))

export function CoursesPage() {
	// Load all the skills data for the courses and use it to determine which skills are left (i.e., need practice).
	const language = useLanguage()
	const classes = useStyles()
	const allSkills = [...new Set(courseOverviews.map(courseOverview => courseOverview.all).flat())] // A list of all relevant skills for all courses.
	const skillsData = useSkillsData(allSkills) // The SkillData objects for all skills.
	const analyses = useMemo(() => Object.values(courseOverviews).map(courseOverview => getAnalysis(courseOverview, skillsData)), [skillsData])

	// Render all the tiles with corresponding data.
	const courseList = Object.values(courses).filter(course => !course.languages || course.languages.includes(language)) // Only render courses that should be shown in this language.
	return (
		<TranslationFile path="eduTools/pages/coursesPage">
			<div className={clsx(classes.courses, 'courses')}>
				{courseList.map((course, index) => <Tile
					key={course.id}
					course={course}
					skillsTotal={courseOverviews[index].course.length}
					skillsDone={analyses[index] ? count(courseOverviews[index].course, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
					recommendation={analyses[index]?.recommendation}
				/>)}
			</div>
		</TranslationFile>
	)
}
