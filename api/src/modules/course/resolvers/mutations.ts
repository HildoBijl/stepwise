import { ForbiddenError } from '../../../errors.ts'

import { getCourseById } from '../service.ts'
import { createCourseResolverSource, validateCourse } from './support.ts'
import type { AuthenticatedCourseContext, CreateCourseInput, UpdateCourseInput } from './types.ts'

export const courseMutationResolvers = {
	createCourse: async (_source: unknown, { input }: { input: CreateCourseInput }, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, user } = context
		ensureSignedIn()
		if (user.role !== 'teacher' && user.role !== 'admin') throw new ForbiddenError('Invalid createCourse call: user does not have the rights to create a new course.')
		validateCourse(input)
		const course = await db.transaction(async transaction => {
			const { blocks, ...courseData } = input
			const course = await db.Course.create(courseData, { transaction })
			course.courseSubscription = await db.CourseSubscription.create({ courseId: course.id, userId: user.id, role: 'teacher' }, { transaction })
			course.blocks = blocks ? await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction }))) : []
			return course
		})
		return createCourseResolverSource(course, context)
	},

	updateCourse: async (_source: unknown, { courseId, input }: { courseId: string; input: UpdateCourseInput }, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, user, isAdmin } = context
		ensureSignedIn()
		const course = await getCourseById(db, courseId, { userId: user.id })
		if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Invalid updateCourse call: user does not have the rights to edit the course with courseId "${courseId}".`)
		validateCourse(input, course)
		const updatedCourse = await db.transaction(async transaction => {
			const { blocks, ...courseData } = input
			await course.update(courseData, { transaction })
			if (blocks !== undefined) {
				await db.CourseBlock.destroy({ where: { courseId: course.id }, transaction })
				course.blocks = blocks ? await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction }))) : []
			}
			return course
		})
		return createCourseResolverSource(updatedCourse, context)
	},

	deleteCourse: async (_source: unknown, { courseId }: { courseId: string }, { db, ensureSignedIn, user, isAdmin }: AuthenticatedCourseContext) => {
		ensureSignedIn()
		const course = await getCourseById(db, courseId, { userId: user.id })
		if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Invalid deleteCourse call: user does not have the rights to remove the course with courseId "${courseId}".`)
		await course.destroy()
		return true
	},

	subscribeToCourse: async (_source: unknown, { courseId }: { courseId: string }, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, userId } = context
		ensureSignedIn()
		const course = await getCourseById(db, courseId, { userId })
		const [courseSubscription] = await db.CourseSubscription.findOrCreate({ where: { courseId, userId }, defaults: { courseId, userId } })
		course.courseSubscription = courseSubscription
		return createCourseResolverSource(course, context)
	},

	unsubscribeFromCourse: async (_source: unknown, { courseId }: { courseId: string }, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, userId } = context
		ensureSignedIn()
		const course = await getCourseById(db, courseId, { userId })
		await db.CourseSubscription.destroy({ where: { courseId, userId } })
		delete course.courseSubscription
		return createCourseResolverSource(course, context)
	},

	promoteToTeacher: async (_source: unknown, { courseId, userId }: { courseId: string; userId: string }, context: AuthenticatedCourseContext) => {
		const { db, ensureSignedIn, userId: currentUserId, isAdmin } = context
		ensureSignedIn()
		const course = await getCourseById(db, courseId, { userId: currentUserId })
		if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Promotion to teacher failed: the user with ID "${currentUserId}" does not have the rights to assign teachers for the course with ID "${courseId}".`)
		const [updatedCount] = await db.CourseSubscription.update({ role: 'teacher' }, { where: { courseId, userId } })
		if (updatedCount === 0) throw new Error(`Promotion to teacher failed: it seems that the user with userId "${userId}" is not subscribed to the course with courseId "${courseId}" and so cannot be promoted to teacher.`)
		return createCourseResolverSource(course, context)
	},
}
