import { findValue } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'

import { type CourseAnalysisContext, type PracticeRecommendation, freePracticeRecommendation } from './types.ts'
import type { CourseProgressAnalysis } from './courseAnalysis.ts'
import type { PracticeNeeded, PracticeNeededMap } from './practice.ts'

export type SkillAdvice = {
	type?: PracticeNeeded
	recommendation?: PracticeRecommendation
}

export function getSkillAdvice({ skillTree, hasExercises }: CourseAnalysisContext, course: Course, analysis: CourseProgressAnalysis | undefined, skillId?: SkillId): SkillAdvice {
	if (!analysis) return {}
	if (!skillId) {
		const recommendation = course.allSkillIds.find(id => analysis.practiceNeeded[id] === 2 && hasExercises(id))
		return recommendation ? { type: 2, recommendation } : { type: 1, recommendation: freePracticeRecommendation }
	}

	switch (analysis.practiceNeeded[skillId]) {
		case undefined:
			return { recommendation: analysis.recommendation }
		case 0:
			return { type: 0, recommendation: findNextSkillToPractice(skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeded) || analysis.recommendation }
		case 1:
			return { type: 1 }
		case 2: {
			const recommendation = findPriorSkillToPractice(skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeded)
			return recommendation === skillId ? { type: 1 } : { type: 2, recommendation }
		}
		default:
			throw new Error('Invalid practice needed index: a practice needed index was given that was not among the available options.')
	}
}

function findPriorSkillToPractice(skillTree: CourseAnalysisContext['skillTree'], hasExercises: CourseAnalysisContext['hasExercises'], skillId: SkillId, courseSkills: readonly SkillId[], practiceNeeded: PracticeNeededMap, includeDoubtfulCases = false): SkillId {
	const recommendation = courseSkills.find(prerequisiteId => skillTree[skillId].prerequisiteIds.includes(prerequisiteId) && (practiceNeeded[prerequisiteId] === 2 || (includeDoubtfulCases && practiceNeeded[prerequisiteId] === 1)) && hasExercises(prerequisiteId))
	if (!recommendation) return skillId
	return findPriorSkillToPractice(skillTree, hasExercises, recommendation, courseSkills, practiceNeeded, includeDoubtfulCases)
}

function findNextSkillToPractice(skillTree: CourseAnalysisContext['skillTree'], hasExercises: CourseAnalysisContext['hasExercises'], skillId: SkillId, courseSkills: readonly SkillId[], practiceNeeded: PracticeNeededMap): SkillId | undefined {
	const continuations = courseSkills.filter(continuationId => skillTree[skillId].continuationIds.includes(continuationId))
	const recommendation = continuations.find(continuationId => (practiceNeeded[continuationId] === 1 || practiceNeeded[continuationId] === 2) && hasExercises(continuationId))
	if (!recommendation) return findValue(continuations, continuationId => findNextSkillToPractice(skillTree, hasExercises, continuationId, courseSkills, practiceNeeded))
	return findPriorSkillToPractice(skillTree, hasExercises, recommendation, courseSkills, practiceNeeded, true)
}
