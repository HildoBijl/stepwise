import { describe, expect, it, test } from 'vitest'

import type { CourseRecord } from '../../../../src/modules/course/index.ts'
import { createCourseDefinition } from '../../../../src/modules/course/service.ts'

describe('course conversion', () => {
	it('maps stored course fields to a course definition', () => {
		const record = {
			startingPoints: ['demo'],
			goals: ['test'],
			goalWeights: [2],
			blocks: [{ goals: ['test'] }],
			setup: null,
		} as unknown as CourseRecord
		const courseDefinition = createCourseDefinition(record)
		expect(courseDefinition.specification).toMatchObject({
			startingPointIds: ['demo'],
			learningGoalIds: ['test'],
			learningGoalWeights: [2],
			blockLearningGoalIds: [['test']],
		})
	})

	it('omits optional fields that are absent', () => {
		const record = { startingPoints: ['demo'], goals: ['test'], goalWeights: null, blocks: undefined, setup: null } as unknown as CourseRecord
		const specification = createCourseDefinition(record).specification
		expect(specification.learningGoalWeights).toBeUndefined()
		expect(specification.blockLearningGoalIds).toBeUndefined()
		expect(specification.setup).toBeUndefined()
	})
})
