import { findOptimum, fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import { expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'
import { SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'
import { freePracticeRecommendation, getAnalysis as getCourseAnalysis, getSkillAdvice as getCourseSkillAdvice } from '@step-wise/course-analysis'
import { hasExercises } from '@step-wise/exercises'

export const strFreePractice = freePracticeRecommendation

export function getAnalysis(course, skillLevelSet) {
	return getCourseAnalysis(course, skillLevelSet, hasExercises)
}

export function getSkillAdvice(course, analysis, skillId) {
	return getCourseSkillAdvice(course, analysis, skillId, hasExercises)
}

export function processStudent(student, course) {
	const { skillTree } = course
	const skills = student.skills.filter(skill => !!skillTree[skill.skillId])
	const storedSkillLevels = fromKeysAndValues(skills.map(skill => skill.skillId), skills.map(skill => ensureSkillLevel(skill)))
	const requiredSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(skillTree, course.allSkillIds)
	const completeSkillLevels = fromKeys(requiredSkillIds, skillId => storedSkillLevels[skillId] ?? getInitialSkillLevel())
	const skillLevelSet = new SkillLevelSet(skillTree, completeSkillLevels)
	const analysis = getAnalysis(course, skillLevelSet)
	if (!analysis) throw new Error('Invalid student analysis: the constructed skill level set did not contain all data required by the course.')

	const activityPerSkill = skills.filter(skill => course.allSkillIds.includes(skill.skillId)).map(skill => new Date(skill.updatedAt))
	const lastActive = findOptimum(activityPerSkill, (a, b) => a > b)
	return { ...student, skills, skillLevelSet, analysis, lastActive }
}
