import React, { createContext, useContext } from 'react'
import { useRouteMatch } from 'react-router-dom'

import { useSkillsData } from '../skills/SkillCacher'
import courses from '../courses'

import { getOverview, getAnalysis } from './util'

const CourseContext = createContext(null)
export default function CourseProvider({ children }) {
	// Examine the requested course.
	const { params } = useRouteMatch()
	const { courseId } = params
	const course = courses[courseId.toLowerCase()]
	const overview = getOverview(course)

	// Analyse the course for the specific user.
	const skillsData = useSkillsData(overview.all)
	const analysis = getAnalysis(overview, skillsData)

	return (
		<CourseContext.Provider value={{courseId, course, overview, skillsData, analysis}}>
			{children}
		</CourseContext.Provider>
	)
}

export function useCourseData() {
	return useContext(CourseContext)
}