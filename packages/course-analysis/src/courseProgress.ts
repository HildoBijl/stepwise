import { count } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { type HasExercises, type PracticeRecommendation, allSkillsHaveExercises, freePracticeRecommendation } from './types.ts'
import { type PracticeNeeds, getCoursePracticeNeeds } from './practiceNeeds.ts'

export type CourseProgressAnalysis = {
	practiceNeeds: PracticeNeeds
	recommendation: PracticeRecommendation
	numCompleted: number
	numCompletedPerBlock: number[]
}

export function analyzeCourseProgress(course: Course, skillLevelSet: SkillLevelSet, hasExercises: HasExercises = allSkillsHaveExercises): CourseProgressAnalysis | undefined {
	const practiceNeeds = getCoursePracticeNeeds(course, skillLevelSet)
	if (!practiceNeeds) return undefined

	const recommendation =
		course.priorKnowledgeIds.find(skillId => practiceNeeds[skillId] === 2 && hasExercises(skillId)) ??
		course.contentSkillIds.find(skillId => practiceNeeds[skillId] === 2 && hasExercises(skillId)) ??
		course.contentSkillIds.find(skillId => practiceNeeds[skillId] === 1 && hasExercises(skillId)) ?? freePracticeRecommendation

	const getNumCompleted = (skillIds: readonly SkillId[]) => count(skillIds, skillId => practiceNeeds[skillId] === 0)
	const numCompleted = getNumCompleted(course.contentSkillIds)
	const numCompletedPerBlock = (course.blocks ?? []).map(block => getNumCompleted(block.contentSkillIds))

	return { practiceNeeds, recommendation, numCompleted, numCompletedPerBlock }
}
