import type { Course } from '@step-wise/course-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { type CourseAnalysisContext, type PracticeRecommendation, freePracticeRecommendation } from './types.ts'
import { type PracticeNeededMap, getPracticeNeeded } from './practice.ts'

export type CourseProgressAnalysis = {
	practiceNeeded: PracticeNeededMap
	recommendation: PracticeRecommendation
}

export function getAnalysis({ skillTree, hasExercises }: CourseAnalysisContext, course: Course, skillLevelSet: SkillLevelSet): CourseProgressAnalysis | undefined {
	const practiceNeeded = getPracticeNeeded(skillTree, course, skillLevelSet)
	if (course.allSkillIds.some(skillId => practiceNeeded[skillId] === undefined)) return undefined

	let recommendation = course.priorKnowledgeIds.find(skillId => practiceNeeded[skillId] === 2 && hasExercises(skillId))
	if (!recommendation) recommendation = course.contentSkillIds.find(skillId => practiceNeeded[skillId] === 2 && hasExercises(skillId))
	if (!recommendation) recommendation = course.contentSkillIds.find(skillId => practiceNeeded[skillId] === 1 && hasExercises(skillId))

	return { practiceNeeded, recommendation: recommendation ?? freePracticeRecommendation }
}
