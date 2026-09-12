import type { CourseRecord } from '../models.ts'
import type { CourseContext, CourseResolverSource } from './types.ts'

export const courseFieldResolvers = {
	Course: {
		id: ({ record }: CourseResolverSource) => record.id,
		code: ({ record }: CourseResolverSource) => record.code,
		name: ({ record }: CourseResolverSource) => record.name,
		description: ({ record }: CourseResolverSource) => record.description,
		goals: ({ record }: CourseResolverSource) => record.goals,
		goalWeights: ({ record }: CourseResolverSource) => record.goalWeights,
		startingPoints: ({ record }: CourseResolverSource) => record.startingPoints,
		setup: ({ record }: CourseResolverSource) => record.setup,
		organization: ({ record }: CourseResolverSource) => record.organization,
		blocks: ({ record }: CourseResolverSource) => record.blocks,
		createdAt: ({ record }: CourseResolverSource) => record.createdAt,
		updatedAt: ({ record }: CourseResolverSource) => record.updatedAt,
		subscription: ({ record, mayViewSubscription }: CourseResolverSource) => mayViewSubscription && record.courseSubscription ? record : null,
		teachers: ({ record, mayViewTeachers }: CourseResolverSource, _args: unknown, { loaders }: CourseContext) => mayViewTeachers ? loaders.courseTeachers.load(record.id) : null,
		students: ({ record, mayViewStudents }: CourseResolverSource, _args: unknown, { loaders }: CourseContext) => mayViewStudents ? loaders.courseStudents.load(record.id) : null,
	},

	CourseSubscription: {
		role: (course: CourseRecord) => course.courseSubscription?.role,
		subscribedAt: (course: CourseRecord) => course.courseSubscription?.createdAt,
	},
}
