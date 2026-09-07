import { createContext, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'

import { useSkillLevels, useCourseQuery, courseRecordToCourseDefinition } from 'api'

import { analyzeCourseProgress } from '../../courses'

const CourseContext = createContext(null)
export function CourseProvider({ children }) {
	// Load the course from the database.
	const { courseCode } = useParams()
	const courseResult = useCourseQuery(courseCode)

	// Depending on if the data is there, set up an empty provider or a provider loading further data.
	const { loading, error, data } = courseResult
	if (loading || error)
		return <CourseContext.Provider value={{ loading, error, course: null, courseDefinition: null, skillLevelSet: null, skillLevelsLoaded: false, analysis: null }}>{children}</CourseContext.Provider>
	return <CourseProviderInner course={data.course || data.courseForStudent}>{children}</CourseProviderInner>
}

function CourseProviderInner({ course, children }) {
	// Analyse the course for the specific user.
	const courseDefinition = useMemo(() => courseRecordToCourseDefinition(course), [course])
	const skillLevelSet = useSkillLevels(courseDefinition.allSkillIds)
	const skillLevelsLoaded = courseDefinition.allSkillIds.every(skillId => skillLevelSet.hasSkillLevel(skillId))
	const analysis = analyzeCourseProgress(courseDefinition, skillLevelSet)
	return <CourseContext.Provider value={{ course, courseDefinition, skillLevelSet, skillLevelsLoaded, analysis }}>{children}</CourseContext.Provider>
}

export function useCourseData() {
	return useContext(CourseContext)
}
