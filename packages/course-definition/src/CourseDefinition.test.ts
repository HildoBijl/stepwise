import { describe, expect, it } from 'vitest'

import { createSkillTree } from '@step-wise/skill-definition'

import { CourseDefinition } from './CourseDefinition.ts'

const skillTree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B', prerequisites: ['a'] },
	c: { name: 'C', prerequisites: ['b'] },
})

describe('CourseDefinition', () => {
	it('validates and stores a copied specification', () => {
		const specification = { startingPointIds: ['b'], learningGoalIds: ['c'], learningGoalWeights: [2] }
		const courseDefinition = new CourseDefinition(skillTree, specification)

		expect(courseDefinition.specification).toEqual(specification)
		expect(courseDefinition.specification).not.toBe(specification)
	})

	it('caches and exposes its analysis and resolution', () => {
		const courseDefinition = new CourseDefinition(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'] })

		expect(courseDefinition.analysis).toBe(courseDefinition.analysis)
		expect(courseDefinition.resolution).toBe(courseDefinition.analysis.resolution)
		expect(courseDefinition.priorKnowledgeIds).toEqual(['a'])
		expect(courseDefinition.startingPointIds).toEqual(['b'])
		expect(courseDefinition.contentSkillIds).toEqual(['b', 'c'])
		expect(courseDefinition.allSkillIds).toEqual(['a', 'b', 'c'])
		expect(courseDefinition.learningGoalIds).toEqual(['c'])
		expect(courseDefinition.learningGoalWeights).toEqual([1])
		expect(courseDefinition.blocks).toBeUndefined()
		expect(courseDefinition.setup).toBeUndefined()
	})

	it('checks the role of a skill in the course', () => {
		const courseDefinition = new CourseDefinition(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'] })

		expect(courseDefinition.hasAsContents('b')).toBe(true)
		expect(courseDefinition.hasAsContents('a')).toBe(false)
		expect(courseDefinition.hasAsPriorKnowledge('a')).toBe(true)
		expect(courseDefinition.hasAsStartingPoint('b')).toBe(true)
		expect(courseDefinition.hasAsLearningGoal('c')).toBe(true)
	})

	it('returns learning-goal weights', () => {
		const courseDefinition = new CourseDefinition(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'], learningGoalWeights: [2] })

		expect(courseDefinition.getLearningGoalWeight('c')).toBe(2)
		expect(courseDefinition.getLearningGoalWeight('b')).toBe(0)
	})
})
