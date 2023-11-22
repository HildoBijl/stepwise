import React, { createContext, useContext } from 'react'
import { useParams } from 'react-router-dom'

import { useSkillsData } from 'api/skill'

import courses from '../../eduTools/courses/courses'

import { getOverview, getAnalysis } from './util'

const CourseContext = createContext(null)
export default function CourseProvider({ children }) {
	// Examine the requested course.
	const { courseId } = useParams()
	const course = courses[courseId.toLowerCase()]
	const overview = getOverview(course)

	// Analyse the course for the specific user.
	const skillsData = useSkillsData(overview.all)
	const skillsDataLoaded = overview.all.every(skillId => !!skillsData[skillId])
	const analysis = getAnalysis(overview, skillsData)
	return (
		<CourseContext.Provider value={{ courseId, course, overview, skillsData, skillsDataLoaded, analysis }}>
			{children}
		</CourseContext.Provider>
	)
}

export function useCourseData() {
	return useContext(CourseContext)
}