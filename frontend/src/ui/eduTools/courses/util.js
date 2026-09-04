import { freePracticeRecommendation, getAnalysis as getCourseAnalysis, getSkillAdvice as getCourseSkillAdvice, processStudent as processCourseStudent } from '@step-wise/course-analysis'
import { hasExercises } from '@step-wise/exercises'

export const strFreePractice = freePracticeRecommendation

export function getAnalysis(course, skillLevelSet) {
	return getCourseAnalysis(course, skillLevelSet, hasExercises)
}

export function getSkillAdvice(course, analysis, skillId) {
	return getCourseSkillAdvice(course, analysis, skillId, hasExercises)
}

export function processStudent(student, course) {
	return processCourseStudent(student, course, hasExercises)
}
