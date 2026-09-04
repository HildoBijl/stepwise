import { findValue } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'

import { type HasExercises, type PracticeRecommendation, allSkillsHaveExercises, freePracticeRecommendation } from './types.ts'
import type { CourseProgressAnalysis } from './courseProgress.ts'
import type { PracticeNeed, PracticeNeeds } from './practiceNeeds.ts'

export type SkillPracticeAdvice = {
	type?: PracticeNeed
	recommendation?: PracticeRecommendation
}

export function getSkillPracticeAdvice(course: Course, analysis: CourseProgressAnalysis | undefined, skillId?: SkillId, hasExercises: HasExercises = allSkillsHaveExercises): SkillPracticeAdvice {
	if (!analysis) return {}
	if (!skillId) {
		const recommendation = course.allSkillIds.find(id => analysis.practiceNeeds[id] === 2 && hasExercises(id))
		return recommendation ? { type: 2, recommendation } : { type: 1, recommendation: freePracticeRecommendation }
	}

	switch (analysis.practiceNeeds[skillId]) {
		case undefined:
			return { recommendation: analysis.recommendation }
		case 0:
			return { type: 0, recommendation: findContinuationToPractice(course.skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeds) || analysis.recommendation }
		case 1:
			return { type: 1 }
		case 2: {
			const recommendation = findPrerequisiteToPractice(course.skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeds)
			return recommendation === skillId ? { type: 1 } : { type: 2, recommendation }
		}
		default:
			throw new Error('Invalid practice need: a practice need was given that was not among the available options.')
	}
}

function findPrerequisiteToPractice(skillTree: Course['skillTree'], hasExercises: HasExercises, skillId: SkillId, courseSkillIds: readonly SkillId[], practiceNeeds: PracticeNeeds, includeOptionalPractice = false): SkillId {
	const recommendation = courseSkillIds.find(prerequisiteId => skillTree[skillId].prerequisiteIds.includes(prerequisiteId) && (practiceNeeds[prerequisiteId] === 2 || (includeOptionalPractice && practiceNeeds[prerequisiteId] === 1)) && hasExercises(prerequisiteId))
	if (!recommendation) return skillId
	return findPrerequisiteToPractice(skillTree, hasExercises, recommendation, courseSkillIds, practiceNeeds, includeOptionalPractice)
}

function findContinuationToPractice(skillTree: Course['skillTree'], hasExercises: HasExercises, skillId: SkillId, courseSkillIds: readonly SkillId[], practiceNeeds: PracticeNeeds): SkillId | undefined {
	const continuations = courseSkillIds.filter(continuationId => skillTree[skillId].continuationIds.includes(continuationId))
	const recommendation = continuations.find(continuationId => (practiceNeeds[continuationId] === 1 || practiceNeeds[continuationId] === 2) && hasExercises(continuationId))
	if (!recommendation) return findValue(continuations, continuationId => findContinuationToPractice(skillTree, hasExercises, continuationId, courseSkillIds, practiceNeeds))
	return findPrerequisiteToPractice(skillTree, hasExercises, recommendation, courseSkillIds, practiceNeeds, true)
}
