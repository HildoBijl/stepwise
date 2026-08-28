import { describe, expect, it } from 'vitest'
import { createSkillTree } from '@step-wise/skill-definition'

import { Course } from './Course.ts'

const skillTree = createSkillTree({
	a: { name: 'A' },
	b: { name: 'B', prerequisites: ['a'] },
	c: { name: 'C', prerequisites: ['b'] },
})

describe('Course', () => {
	it('validates and stores a copied definition', () => {
		const definition = { startingPointIds: ['b'], learningGoalIds: ['c'], learningGoalWeights: [2] }
		const course = new Course(skillTree, definition)

		expect(course.definition).toEqual(definition)
		expect(course.definition).not.toBe(definition)
	})

	it('caches and exposes its analysis and resolution', () => {
		const course = new Course(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'] })

		expect(course.analysis).toBe(course.analysis)
		expect(course.resolution).toBe(course.analysis.resolution)
		expect(course.priorKnowledgeIds).toEqual(['a'])
		expect(course.startingPointIds).toEqual(['b'])
		expect(course.contentSkillIds).toEqual(['b', 'c'])
		expect(course.allSkillIds).toEqual(['a', 'b', 'c'])
		expect(course.learningGoalIds).toEqual(['c'])
		expect(course.learningGoalWeights).toEqual([1])
		expect(course.blocks).toBeUndefined()
		expect(course.setup).toBeUndefined()
	})

	it('checks the role of a skill in the course', () => {
		const course = new Course(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'] })

		expect(course.hasAsContents('b')).toBe(true)
		expect(course.hasAsContents('a')).toBe(false)
		expect(course.hasAsPriorKnowledge('a')).toBe(true)
		expect(course.hasAsStartingPoint('b')).toBe(true)
		expect(course.hasAsLearningGoal('c')).toBe(true)
	})

	it('returns learning-goal weights', () => {
		const course = new Course(skillTree, { startingPointIds: ['b'], learningGoalIds: ['c'], learningGoalWeights: [2] })

		expect(course.getLearningGoalWeight('c')).toBe(2)
		expect(course.getLearningGoalWeight('b')).toBe(0)
	})
})
