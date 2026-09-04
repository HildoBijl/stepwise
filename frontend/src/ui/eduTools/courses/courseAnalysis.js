import { analyzeCourseProgress as analyzeGenericCourseProgress, getSkillPracticeAdvice as getGenericSkillPracticeAdvice } from '@step-wise/course-analysis'
import { hasExercises } from '@step-wise/exercises'

export function analyzeCourseProgress(course, skillLevelSet) {
	return analyzeGenericCourseProgress(course, skillLevelSet, hasExercises)
}

export function getSkillPracticeAdvice(course, analysis, skillId) {
	return getGenericSkillPracticeAdvice(course, analysis, skillId, hasExercises)
}
