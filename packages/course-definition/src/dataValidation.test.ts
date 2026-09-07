import { describe, expect, it } from 'vitest'

import type { CourseSpecification } from './types.ts'
import { ensureCourseSpecification } from './dataValidation.ts'

describe('ensureCourseSpecification', () => {
	it('validates and copies a course specification', () => {
		const specification: CourseSpecification = { startingPointIds: ['a'], learningGoalIds: ['b'], learningGoalWeights: [2], blockLearningGoalIds: [['b']] }
		const result = ensureCourseSpecification(specification)

		expect(result).toEqual(specification)
		expect(result).not.toBe(specification)
		expect(result.startingPointIds).not.toBe(specification.startingPointIds)
		expect(result.blockLearningGoalIds?.[0]).not.toBe(specification.blockLearningGoalIds?.[0])
	})

	it('allows an empty course when optional values are omitted', () => {
		expect(ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [] })).toEqual({
			startingPointIds: [],
			learningGoalIds: [],
			learningGoalWeights: undefined,
			blockLearningGoalIds: undefined,
			setup: undefined,
		})
	})

	it('rejects invalid endpoint arrays and skill IDs', () => {
		expect(() => ensureCourseSpecification({ startingPointIds: 'a', learningGoalIds: [] } as unknown as CourseSpecification)).toThrow()
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [1] } as unknown as CourseSpecification)).toThrow()
	})

	it('rejects duplicate endpoints', () => {
		expect(() => ensureCourseSpecification({ startingPointIds: ['a', 'a'], learningGoalIds: [] })).toThrow(/duplicate skills/)
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a', 'a'] })).toThrow(/duplicate skills/)
	})

	it('accepts non-negative learning-goal weights with a positive sum', () => {
		expect(ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a', 'b'], learningGoalWeights: [0, 2] }).learningGoalWeights).toEqual([0, 2])
	})

	it('rejects invalid learning-goal weights', () => {
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [-1] })).toThrow()
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [Infinity] })).toThrow()
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a'], learningGoalWeights: [1, 2] })).toThrow(/expected 1 weights/)
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: ['a', 'b'], learningGoalWeights: [0, 0] })).toThrow(/positive sum/)
	})

	it('rejects malformed block learning goals', () => {
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [], blockLearningGoalIds: ['a'] } as unknown as CourseSpecification)).toThrow()
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [], blockLearningGoalIds: [[1]] } as unknown as CourseSpecification)).toThrow()
	})

	it('normalizes a string setup and rejects invalid setups', () => {
		expect(ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [], setup: 'a' }).setup?.getSkillList()).toEqual(['a'])
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [], setup: null } as unknown as CourseSpecification)).toThrow()
		expect(() => ensureCourseSpecification({ startingPointIds: [], learningGoalIds: [], setup: '' })).toThrow()
	})
})
