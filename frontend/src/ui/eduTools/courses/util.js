import { freePracticeRecommendation, getAnalysis as getCourseAnalysis, getSkillAdvice as getCourseSkillAdvice, processStudent as processCourseStudent } from '@step-wise/course-analysis'
import { skillTree } from '@step-wise/skill-tree'
import { hasExercises } from '@step-wise/exercises'

const courseAnalysisContext = { skillTree, hasExercises }

export const strFreePractice = freePracticeRecommendation

export function getAnalysis(course, skillLevelSet) {
	return getCourseAnalysis(courseAnalysisContext, course, skillLevelSet)
}

export function getSkillAdvice(course, analysis, skillId) {
	return getCourseSkillAdvice(courseAnalysisContext, course, analysis, skillId)
}

export function processStudent(student, course) {
	return processCourseStudent(courseAnalysisContext, student, course)
}
