import { getCourseByCode, getCourses } from '../service.ts'
import { createCourseResolverSource } from './support.ts'
import type { AuthenticatedCourseContext, CourseContext } from './types.ts'

export const courseQueryResolvers = {
	allCourses: async (_source: unknown, _args: unknown, context: CourseContext) => (await getCourses(context.db, { ...(context.userId ? { userId: context.userId } : {}) })).map(course => createCourseResolverSource(course, context)),

	myCourses: async (_source: unknown, _args: unknown, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, userId } = context
		ensureSignedIn()
		return (await getCourses(db, { userId, onlyOwnCourses: true })).map(course => createCourseResolverSource(course, context))
	},

	course: async (_source: unknown, { code }: { code: string }, context: CourseContext) => createCourseResolverSource(await getCourseByCode(context.db, code, { ...(context.userId ? { userId: context.userId } : {}) }), context),
}
