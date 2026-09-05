import { describe, expect, it } from 'vitest'

import type { CourseProgressAnalysis } from './courseProgress.ts'
import { getSkillPracticeAdvice } from './skillPracticeAdvice.ts'
import { freePracticeRecommendation } from './types.ts'
import { course } from './testUtils.ts'

const createAnalysis = (practiceNeeds: CourseProgressAnalysis['practiceNeeds'], recommendation: CourseProgressAnalysis['recommendation']): CourseProgressAnalysis => ({
	practiceNeeds,
	recommendation,
	numCompleted: 0,
	numCompletedPerBlock: [],
})

describe('getSkillPracticeAdvice', () => {
	it('returns undefined without a course analysis', () => {
		expect(getSkillPracticeAdvice(course, undefined, 'basic')).toBeUndefined()
	})

	it('stays in free practice when only recommended practice remains', () => {
		const analysis = createAnalysis({ basic: 1 }, 'basic')
		expect(getSkillPracticeAdvice(course, analysis)).toEqual({ type: 'stay', recommendation: freePracticeRecommendation })
	})

	it('leaves free practice for a skill that requires practice', () => {
		const analysis = createAnalysis({ basic: 2 }, 'basic')
		expect(getSkillPracticeAdvice(course, analysis)).toEqual({ type: 'goBack', recommendation: 'basic' })
	})

	it('identifies a supplied skill outside the course', () => {
		const analysis = createAnalysis({ basic: 1 }, 'basic')
		expect(getSkillPracticeAdvice(course, analysis, 'outside')).toEqual({ type: 'notInCourse', recommendation: 'basic' })
	})

	it('stays on a skill for which practice is recommended', () => {
		const analysis = createAnalysis({ basic: 1 }, 'basic')
		expect(getSkillPracticeAdvice(course, analysis, 'basic')).toEqual({ type: 'stay', recommendation: 'basic' })
	})

	it('stays on a required skill when no deficient prerequisite is available', () => {
		const analysis = createAnalysis({ foundation: 0, basic: 2 }, 'basic')
		expect(getSkillPracticeAdvice(course, analysis, 'basic')).toEqual({ type: 'stay', recommendation: 'basic' })
	})

	it('goes back recursively to the earliest deficient prerequisite', () => {
		const analysis = createAnalysis({ foundation: 2, basic: 2, intermediate: 2 }, 'foundation')
		expect(getSkillPracticeAdvice(course, analysis, 'intermediate')).toEqual({ type: 'goBack', recommendation: 'foundation' })
	})

	it('moves onward through mastered continuations to a skill needing practice', () => {
		const analysis = createAnalysis({ foundation: 0, basic: 0, intermediate: 0, advanced: 1 }, 'advanced')
		expect(getSkillPracticeAdvice(course, analysis, 'basic')).toEqual({ type: 'moveOnward', recommendation: 'advanced' })
	})

	it('skips continuation skills without exercises', () => {
		const analysis = createAnalysis({ foundation: 0, basic: 0, intermediate: 1, advanced: 1 }, 'intermediate')
		const hasExercises = (skillId: string) => skillId !== 'intermediate'

		expect(getSkillPracticeAdvice(course, analysis, 'basic', hasExercises)).toEqual({ type: 'moveOnward', recommendation: 'advanced' })
	})

	it('moves onward to free practice when no continuation needs practice', () => {
		const analysis = createAnalysis({ foundation: 0, basic: 0, intermediate: 0, advanced: 0 }, freePracticeRecommendation)
		expect(getSkillPracticeAdvice(course, analysis, 'advanced')).toEqual({ type: 'moveOnward', recommendation: freePracticeRecommendation })
	})
})
