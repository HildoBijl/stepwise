import { analyzeCourseProgress as analyzeGenericCourseProgress, getSkillPracticeAdvice as getGenericSkillPracticeAdvice } from '@step-wise/course-analysis'
import { hasExercises } from '@step-wise/exercises'

export function analyzeCourseProgress(courseDefinition, skillLevelSet) {
	return analyzeGenericCourseProgress(courseDefinition, skillLevelSet, hasExercises)
}

export function getSkillPracticeAdvice(courseDefinition, analysis, skillId) {
	return getGenericSkillPracticeAdvice(courseDefinition, analysis, skillId, hasExercises)
}
