import { count } from '@step-wise/js-utils'
import type { Course } from '@step-wise/course-definition'
import type { SkillId } from '@step-wise/skill-definition'
import type { SkillLevelSet } from '@step-wise/skill-tracking'

import { type HasExercises, type PracticeRecommendation, defaultHasExercises, freePracticeRecommendation } from './types.ts'
import { type PracticeNeededMap, getPracticeNeeded } from './practice.ts'

export type CourseProgressAnalysis = {
	practiceNeeded: PracticeNeededMap
	recommendation: PracticeRecommendation
	numCompleted: number
	numCompletedPerBlock: number[]
}

export function getAnalysis(course: Course, skillLevelSet: SkillLevelSet, hasExercises: HasExercises = defaultHasExercises): CourseProgressAnalysis | undefined {
	const practiceNeeded = getPracticeNeeded(course, skillLevelSet)
	if (!practiceNeeded) return undefined

	let recommendation =
		course.priorKnowledgeIds.find(skillId => practiceNeeded[skillId] === 2 && hasExercises(skillId)) ??
		course.contentSkillIds.find(skillId => practiceNeeded[skillId] === 2 && hasExercises(skillId)) ??
		course.contentSkillIds.find(skillId => practiceNeeded[skillId] === 1 && hasExercises(skillId)) ?? freePracticeRecommendation
	const getNumCompleted = (skillIds: readonly SkillId[]) => count(skillIds, skillId => practiceNeeded[skillId] === 0)
	const numCompleted = getNumCompleted(course.contentSkillIds)
	const numCompletedPerBlock = (course.blocks ?? []).map(block => getNumCompleted(block.contentSkillIds))

	return { practiceNeeded, recommendation, numCompleted, numCompletedPerBlock }
}
