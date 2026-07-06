import { createContext, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { Course } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { useSkillLevels, useCourseQuery, courseRecordToCourseData } from 'api'

import { getAnalysis } from '../../courses'

const CourseContext = createContext(null)
export function CourseProvider({ children }) {
	// Load the course from the database.
	const { courseCode } = useParams()
	const courseResult = useCourseQuery(courseCode)

	// Depending on if the data is there, set up an empty provider or a provider loading further data.
	const { loading, error, data } = courseResult
	if (loading || error)
		return <CourseContext.Provider value={{ loading, error, course: null, overview: null, skillsData: null, skillsDataLoaded: false, analysis: null }}>{children}</CourseContext.Provider>
	return <CourseProviderInner course={data.course || data.courseForStudent}>{children}</CourseProviderInner>
}

function CourseProviderInner({ course, children }) {
	// Analyse the course for the specific user.
	const overview = useMemo(() => new Course(skillTree, courseRecordToCourseData(course)), [course])
	const skillsData = useSkillLevels(overview.allSkills)
	const skillsDataLoaded = overview.allSkills.every(skillId => !!skillsData[skillId])
	const analysis = getAnalysis(overview, skillsData)
	return <CourseContext.Provider value={{ course, overview, skillsData, skillsDataLoaded, analysis }}>{children}</CourseContext.Provider>
}

export function useCourseData() {
	return useContext(CourseContext)
}
