import React, { useMemo } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { count } from 'step-wise/util/arrays'

import { useSkillsData } from 'api/skill'

import { getOverview, getAnalysis } from '../course/util'
import courses from '../courses'

import Tile from './Tile'

const courseOverviews = Object.values(courses).map(getOverview)

const useStyles = makeStyles((theme) => ({
	courses: {
		display: 'grid',
		gap: '1rem',
		gridTemplateColumns: 'repeat(auto-fill, minmax(11rem, 1fr))',
		gridAutoRows: '8.5rem',
	},
}))

export default function Courses() {
	// Load all the skills data for the courses and use it to determine which skills are left (i.e., need practice).
	const classes = useStyles()
	const allSkills = [...new Set(courseOverviews.map(courseOverview => courseOverview.all).flat())] // A list of all relevant skills for all courses.
	const skillsData = useSkillsData(allSkills) // The SkillData objects for all skills.
	const analyses = useMemo(() => Object.values(courseOverviews).map(courseOverview => getAnalysis(courseOverview, skillsData)), [skillsData])

	// Render all the tiles with corresponding data.
	return (
		<div className={clsx(classes.courses, 'courses')}>
			{Object.values(courses).map((course, index) => <Tile
				key={course.id}
				course={course}
				skillsTotal={courseOverviews[index].course.length}
				skillsDone={analyses[index] ? count(courseOverviews[index].course, (skillId) => analyses[index].practiceNeeded[skillId] === 0) : '0'}
				recommendation={analyses[index]?.recommendation}
			/>)}
		</div>
	)
}

