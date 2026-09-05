import { findValue } from '@step-wise/js-utils'
import type { SkillId } from '@step-wise/skill-definition'
import type { Course } from '@step-wise/course-definition'

import { type HasExercises, type PracticeRecommendation, allSkillsHaveExercises, freePracticeRecommendation } from './types.ts'
import type { CourseProgressAnalysis } from './courseProgress.ts'
import type { PracticeNeeds } from './practiceNeeds.ts'

export type SkillPracticeAdviceType = 'goBack' | 'stay' | 'moveOnward' | 'notInCourse'
export type SkillPracticeAdvice = {
	type: SkillPracticeAdviceType
	recommendation: PracticeRecommendation
}

export function getSkillPracticeAdvice(course: Course, analysis: CourseProgressAnalysis | undefined, skillId?: SkillId, hasExercises: HasExercises = allSkillsHaveExercises): SkillPracticeAdvice | undefined {
	if (!analysis) return undefined

	// Without a current skill, the student is using free practice. Only recommend leaving it for a skill that requires practice.
	if (skillId === undefined) {
		const { recommendation } = analysis
		if (recommendation === freePracticeRecommendation) return { type: 'stay', recommendation }
		const practiceNeed = analysis.practiceNeeds[recommendation]
		if (practiceNeed === undefined) throw new Error('Invalid course analysis: the recommended skill does not have a practice need.')
		return practiceNeed === 2 ? { type: 'goBack', recommendation } : { type: 'stay', recommendation: freePracticeRecommendation }
	}

	// A skill outside the analyzed course cannot receive local advice, so fall back to the course recommendation.
	if (analysis.practiceNeeds[skillId] === undefined) {
		const { recommendation } = analysis
		return { type: 'notInCourse', recommendation }
	}

	// The student is currently practicing a skill that is part of the course. Give advice based on the practice need for that skill.
	switch (analysis.practiceNeeds[skillId]) {
		case 0:
			return { type: 'moveOnward', recommendation: findContinuationToPractice(course.skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeds) ?? analysis.recommendation }
		case 1:
			return { type: 'stay', recommendation: skillId }
		case 2: {
			const recommendation = findPrerequisiteToPractice(course.skillTree, hasExercises, skillId, course.allSkillIds, analysis.practiceNeeds)
			return recommendation === skillId ? { type: 'stay', recommendation } : { type: 'goBack', recommendation }
		}
		default:
			throw new Error('Invalid practice need: a practice need was given that was not among the available options.')
	}
}

function findPrerequisiteToPractice(skillTree: Course['skillTree'], hasExercises: HasExercises, skillId: SkillId, courseSkillIds: readonly SkillId[], practiceNeeds: PracticeNeeds, includeRecommendedPractice = false): SkillId {
	const recommendation = courseSkillIds.find(prerequisiteId => skillTree[skillId].prerequisiteIds.includes(prerequisiteId) && (practiceNeeds[prerequisiteId] === 2 || (includeRecommendedPractice && practiceNeeds[prerequisiteId] === 1)) && hasExercises(prerequisiteId))
	if (!recommendation) return skillId
	return findPrerequisiteToPractice(skillTree, hasExercises, recommendation, courseSkillIds, practiceNeeds, includeRecommendedPractice)
}

function findContinuationToPractice(skillTree: Course['skillTree'], hasExercises: HasExercises, skillId: SkillId, courseSkillIds: readonly SkillId[], practiceNeeds: PracticeNeeds): SkillId | undefined {
	const continuations = courseSkillIds.filter(continuationId => skillTree[skillId].continuationIds.includes(continuationId))
	const recommendation = continuations.find(continuationId => (practiceNeeds[continuationId] === 1 || practiceNeeds[continuationId] === 2) && hasExercises(continuationId))
	if (!recommendation) return findValue(continuations, continuationId => findContinuationToPractice(skillTree, hasExercises, continuationId, courseSkillIds, practiceNeeds))
	return findPrerequisiteToPractice(skillTree, hasExercises, recommendation, courseSkillIds, practiceNeeds, true)
}
