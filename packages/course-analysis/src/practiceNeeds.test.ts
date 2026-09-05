import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createSkillTree } from '@step-wise/skill-definition'
import { Course } from '@step-wise/course-definition'

import { getCoursePracticeNeeds, getPracticeNeed } from './practiceNeeds.ts'
import { course, createSkillLevelSet, now, skillTree } from './testUtils.ts'

beforeEach(() => vi.useFakeTimers().setSystemTime(now))
afterEach(() => vi.useRealTimers())

describe('getPracticeNeed', () => {
	it.each([
		[0, 0],
		[1, 1],
		[2, 2],
	] as const)('returns practice need %i for the corresponding skill level', (storedPracticeNeed, expectedPracticeNeed) => {
		const skillLevelSet = createSkillLevelSet(skillTree, { basic: storedPracticeNeed })
		expect(getPracticeNeed('basic', skillLevelSet, { skillThresholds: skillTree.basic.thresholds })).toBe(expectedPracticeNeed)
	})

	it('uses the prior-knowledge thresholds', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 1 })
		const skillThresholds = { mastery: 0.6, recap: 0.4, priorKnowledgeMastery: 0.7, priorKnowledgeRecap: 0.6 }

		expect(getPracticeNeed('foundation', skillLevelSet, { skillThresholds })).toBe(1)
		expect(getPracticeNeed('foundation', skillLevelSet, { skillThresholds, priorKnowledge: true })).toBe(2)
	})

	it('returns undefined when required skill-level data is missing', () => {
		const linkedTree = createSkillTree({ first: { name: 'First', links: 'second' }, second: { name: 'Second' } })
		const skillLevelSet = createSkillLevelSet(linkedTree, {}, ['second'])

		expect(getPracticeNeed('first', skillLevelSet, { skillThresholds: linkedTree.first.thresholds })).toBeUndefined()
	})
})

describe('getCoursePracticeNeeds', () => {
	it('propagates the maximum need permitted by mastered continuation skills', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 2, basic: 2, intermediate: 1, advanced: 0 })

		expect(getCoursePracticeNeeds(course, skillLevelSet)).toEqual({ advanced: 0, intermediate: 0, basic: 0, foundation: 0 })
	})

	it('combines multiple learning-goal branches through shared prerequisites', () => {
		const branchingCourse = new Course(skillTree, { startingPointIds: ['basic'], learningGoalIds: ['advanced', 'alternative'] })
		const skillLevelSet = createSkillLevelSet(skillTree, { foundation: 2, basic: 2, intermediate: 2, advanced: 2, alternative: 1 })

		expect(getCoursePracticeNeeds(branchingCourse, skillLevelSet)).toEqual({
			advanced: 2,
			intermediate: 2,
			alternative: 1,
			basic: 1,
			foundation: 1,
		})
	})

	it('returns undefined when the course data is incomplete', () => {
		const skillLevelSet = createSkillLevelSet(skillTree, {}, ['intermediate'])
		expect(getCoursePracticeNeeds(course, skillLevelSet)).toBeUndefined()
	})
})
