import { count, findOptimum, fromKeys, fromKeysAndValues } from '@step-wise/js-utils'
import { type SkillId, expandSkillIdsWithDirectPrerequisitesAndLinks } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'
import { type SkillLevelData, SkillLevelSet, ensureSkillLevel, getInitialSkillLevel } from '@step-wise/skill-tracking'

import type { CourseAnalysisContext } from './types.ts'
import { type CourseProgressAnalysis, getAnalysis } from './courseAnalysis.ts'

export type StudentSkillData = SkillLevelData & {
	updatedAt: Date | string
}

export type StudentData = {
	skills: StudentSkillData[]
}

export type ProcessedStudent<TStudent extends StudentData> = Omit<TStudent, 'skills'> & {
	skills: TStudent['skills']
	skillLevelSet: SkillLevelSet
	analysis: CourseProgressAnalysis
	numCompleted: number
	numCompletedPerBlock: number[]
	lastActive: Date | undefined
}

export function processStudent<TStudent extends StudentData>({ skillTree, hasExercises }: CourseAnalysisContext, student: TStudent, course: Course): ProcessedStudent<TStudent> {
	const existingSkills = student.skills.filter(skill => !!skillTree[skill.skillId])
	const skillsAsObject = fromKeysAndValues(existingSkills.map(skill => skill.skillId), existingSkills.map(skill => ensureSkillLevel(skill)))

	const allSkillIds = expandSkillIdsWithDirectPrerequisitesAndLinks(skillTree, course.allSkillIds)
	const skills = fromKeys(allSkillIds, skillId => skillsAsObject[skillId] ?? getInitialSkillLevel())
	const skillLevelSet = new SkillLevelSet(skillTree, skills)
	const analysis = getAnalysis({ skillTree, hasExercises }, course, skillLevelSet)
	if (!analysis) throw new Error('Invalid student analysis: the constructed skill level set did not contain all data required by the course.')

	const getNumCompleted = (skillIds: readonly SkillId[]) => count(skillIds, skillId => analysis.practiceNeeded[skillId] === 0)
	const numCompleted = getNumCompleted(course.contentSkillIds)
	const numCompletedPerBlock = (course.blocks ?? []).map(block => getNumCompleted(block.contentSkillIds))
	const activityPerSkill = existingSkills.filter(skill => course.allSkillIds.includes(skill.skillId)).map(skill => new Date(skill.updatedAt))
	const lastActive = findOptimum(activityPerSkill, (a, b) => a > b)

	return { ...student, skills: existingSkills, skillLevelSet, analysis, numCompleted, numCompletedPerBlock, lastActive }
}
