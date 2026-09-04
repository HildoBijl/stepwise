import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { analyzeCourseProgress } from './courseProgress.ts'
import { freePracticeRecommendation } from './types.ts'
import { course, createSkillLevelSet, now, skillTree } from './testUtils.ts'

beforeEach(() => vi.useFakeTimers().setSystemTime(now))
afterEach(() => vi.useRealTimers())

describe('analyzeCourseProgress', () => {
	it('prioritizes required prior knowledge over required course content', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 2, basic: 2, intermediate: 2, advanced: 2 })
		expect(analyzeCourseProgress(course, skillLevelSet)?.recommendation).toBe('foundation')
	})

	it('prioritizes required practice over recommended practice', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 1, basic: 2, intermediate: 2, advanced: 2 })
		expect(analyzeCourseProgress(course, skillLevelSet)?.recommendation).toBe('basic')
	})

	it('recommends optional practice when no skill requires practice', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 1, basic: 1, intermediate: 1, advanced: 1 })
		expect(analyzeCourseProgress(course, skillLevelSet)?.recommendation).toBe('basic')
	})

	it('falls back to free practice when the course is mastered', () => {
		const skillLevelSet = createSkillLevelSet(skillTree)
		expect(analyzeCourseProgress(course, skillLevelSet)?.recommendation).toBe(freePracticeRecommendation)
	})

	it('skips skills without exercises when choosing a recommendation', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 2, basic: 2, intermediate: 2, advanced: 2 })
		const hasExercises = (skillId: string) => skillId !== 'foundation' && skillId !== 'basic'

		expect(analyzeCourseProgress(course, skillLevelSet, hasExercises)?.recommendation).toBe('intermediate')
	})

	it('counts completed content skills for the course and its blocks', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { advanced: 2 })
		const analysis = analyzeCourseProgress(course, skillLevelSet)

		expect(analysis?.numCompleted).toBe(2)
		expect(analysis?.numCompletedPerBlock).toEqual([2, 0])
	})

	it('returns undefined when the course data is incomplete', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, {}, ['intermediate'])
		expect(analyzeCourseProgress(course, skillLevelSet)).toBeUndefined()
	})
})
