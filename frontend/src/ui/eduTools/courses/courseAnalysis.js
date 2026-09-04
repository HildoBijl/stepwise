import { getAnalysis as getCourseAnalysis, getSkillAdvice as getCourseSkillAdvice } from '@step-wise/course-analysis'
import { hasExercises } from '@step-wise/exercises'

export function getAnalysis(course, skillLevelSet) {
	return getCourseAnalysis(course, skillLevelSet, hasExercises)
}

export function getSkillAdvice(course, analysis, skillId) {
	return getCourseSkillAdvice(course, analysis, skillId, hasExercises)
}
