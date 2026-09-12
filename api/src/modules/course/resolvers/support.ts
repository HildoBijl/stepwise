import { deserializeSetup } from '@step-wise/skill-setup'
import { CourseDefinition, validateCourseDiagnostics } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { InvalidInputError } from '../../../errors.ts'

import type { CourseRecord } from '../models.ts'
import type { CourseContext, CourseResolverSource, CreateCourseInput, UpdateCourseInput } from './types.ts'

export function createCourseResolverSource(record: CourseRecord, { isSignedIn, user }: Pick<CourseContext, 'isSignedIn' | 'user'>): CourseResolverSource {
	return {
		record,
		mayViewSubscription: isSignedIn,
		mayViewTeachers: isSignedIn,
		mayViewStudents: isSignedIn && (record.courseSubscription?.role === 'teacher' || user?.role === 'admin'),
	}
}

export function validateCourse(input: CreateCourseInput | UpdateCourseInput, current?: CourseRecord) {
	const nonNullableFields = ['code', 'name', 'goals', 'startingPoints', 'organization'] as const
	nonNullableFields.forEach(field => {
		if (Reflect.get(input, field) === null) throw new InvalidInputError(`Course field "${field}" cannot be null.`)
	})

	const serializedSetup = input.setup === undefined ? current?.setup : input.setup
	const startingPointIds = input.startingPoints === undefined ? current?.startingPoints : input.startingPoints
	const learningGoalIds = input.goals === undefined ? current?.goals : input.goals
	if (!startingPointIds || !learningGoalIds) throw new Error('Cannot validate a course without starting points and learning goals.')
	const learningGoalWeights = input.goalWeights === undefined ? current?.goalWeights : input.goalWeights
	const blocks = input.blocks === undefined ? current?.blocks : input.blocks
	const data = {
		startingPointIds,
		learningGoalIds,
		...(learningGoalWeights ? { learningGoalWeights } : {}),
		...(blocks ? { blockLearningGoalIds: blocks.map(block => block.goals) } : {}),
		...(serializedSetup ? { setup: deserializeSetup(serializedSetup) } : {}),
	}
	validateCourseDiagnostics(new CourseDefinition(skillTree, data).diagnostics)
}
