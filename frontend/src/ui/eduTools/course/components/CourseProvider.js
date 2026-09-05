import { createContext, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useSkillLevels, useCourseQuery, courseRecordToCourse } from 'api'

import { analyzeCourseProgress } from '../../courses'

const CourseContext = createContext(null)
export function CourseProvider({ children }) {
	// Load the course from the database.
	const { courseCode } = useParams()
	const courseResult = useCourseQuery(courseCode)

	// Depending on if the data is there, set up an empty provider or a provider loading further data.
	const { loading, error, data } = courseResult
	if (loading || error)
		return <CourseContext.Provider value={{ loading, error, course: null, overview: null, skillLevelSet: null, skillLevelsLoaded: false, analysis: null }}>{children}</CourseContext.Provider>
	return <CourseProviderInner course={data.course || data.courseForStudent}>{children}</CourseProviderInner>
}

function CourseProviderInner({ course, children }) {
	// Analyse the course for the specific user.
	const overview = useMemo(() => courseRecordToCourse(course), [course])
	const skillLevelSet = useSkillLevels(overview.allSkillIds)
	const skillLevelsLoaded = overview.allSkillIds.every(skillId => skillLevelSet.hasSkillLevel(skillId))
	const analysis = analyzeCourseProgress(overview, skillLevelSet)
	return <CourseContext.Provider value={{ course, overview, skillLevelSet, skillLevelsLoaded, analysis }}>{children}</CourseContext.Provider>
}

export function useCourseData() {
	return useContext(CourseContext)
}
