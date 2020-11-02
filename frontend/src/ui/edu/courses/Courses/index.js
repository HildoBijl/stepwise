import React from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'

import { useSkillsData } from '../../skills/SkillCacher'
import { getSkillRecommendation } from '../../skills/util'

import courses from '../courses'
import { getCourseSkills } from '../util'

import Tile from './Tile'

const useStyles = makeStyles((theme) => ({
	courses: {
		display: 'grid',
		gap: '1rem',
		gridTemplateColumns: 'repeat(auto-fill, minmax(9.6rem, 1fr))',
	},
}))

export default function Courses() {
	// Load all the skills data for the courses and use it to determine which skills are left (i.e., need practice).
	const classes = useStyles()
	const courseSkills = Object.values(courses).map(getCourseSkills)
	const allSkills = [...new Set(courseSkills.map(courseList => courseList.course).flat())]
	const skillsData = useSkillsData(allSkills)
	const courseSkillsLeft = Object.values(courses).map(course => getCourseSkills(course, skillsData))
	const recommendations = courseSkills.map(skillLists => getSkillRecommendation(skillsData, skillLists.priorKnowledge, skillLists.course))

	// Render all the tiles with corresponding data.
	return (
		<div className={clsx(classes.courses, 'courses')}>
			{Object.values(courses).map((course, index) => <Tile key={course.name} course={course} skillsTotal={courseSkills[index].course.length} skillsLeft={courseSkillsLeft[index].course.length} recommendation={recommendations[index]} />)}
		</div>
	)
}

