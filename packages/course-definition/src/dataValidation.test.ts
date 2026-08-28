import { describe, expect, it } from 'vitest'

import type { CourseDefinition } from './types.ts'
import { ensureCourseDefinition } from './dataValidation.ts'

describe('ensureCourseDefinition', () => {
	it('validates and copies a course definition', () => {
		const definition: CourseDefinition = { startingPointIds: ['a'], learningGoalIds: ['b'], learningGoalWeights: [2], blockLearningGoalIds: [['b']] }
		const result = ensureCourseDefinition(definition)

		expect(result).toEqual(definition)
		expect(result).not.toBe(definition)
		expect(result.startingPointIds).not.toBe(definition.startingPointIds)
		expect(result.blockLearningGoalIds?.[0]).not.toBe(definition.blockLearningGoalIds?.[0])
	})

	it('allows an empty course when optional values are omitted', () => {
		expect(ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [] })).toEqual({
			startingPointIds: [],
			learningGoalIds: [],
			learningGoalWeights: undefined,
			blockLearningGoalIds: undefined,
			setup: undefined,
		})
	})

	it('rejects invalid endpoint arrays and skill IDs', () => {
		expect(() => ensureCourseDefinition({ startingPointIds: 'a', learningGoalIds: [] } as unknown as CourseDefinition)).toThrow()
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [1] } as unknown as CourseDefinition)).toThrow()
	})

	it('rejects duplicate endpoints', () => {
		expect(() => ensureCourseDefinition({ startingPointIds: ['a', 'a'], learningGoalIds: [] })).toThrow(/duplicate skills/)
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a', 'a'] })).toThrow(/duplicate skills/)
	})

	it('accepts non-negative learning-goal weights with a positive sum', () => {
		expect(ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a', 'b'], learningGoalWeights: [0, 2] }).learningGoalWeights).toEqual([0, 2])
	})

	it('rejects invalid learning-goal weights', () => {
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [-1] })).toThrow()
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [Infinity] })).toThrow()
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [1, 2] })).toThrow(/expected 1 weights/)
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: ['a', 'b'], learningGoalWeights: [0, 0] })).toThrow(/positive sum/)
	})

	it('rejects malformed block learning goals', () => {
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [], blockLearningGoalIds: ['a'] } as unknown as CourseDefinition)).toThrow()
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [], blockLearningGoalIds: [[1]] } as unknown as CourseDefinition)).toThrow()
	})

	it('normalizes a string setup and rejects invalid setups', () => {
		expect(ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [], setup: 'a' }).setup?.getSkillList()).toEqual(['a'])
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [], setup: null } as unknown as CourseDefinition)).toThrow()
		expect(() => ensureCourseDefinition({ startingPointIds: [], learningGoalIds: [], setup: '' })).toThrow()
	})
})
