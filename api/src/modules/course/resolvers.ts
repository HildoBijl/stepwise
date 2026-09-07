import { type SerializedSkillSetup, deserializeSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'
import { CourseDefinition, validateCourseDiagnostics } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { ForbiddenError, InvalidInputError } from '../../errors.ts'

import type { ApiContext } from '../types.ts'
import type { AuthenticatedContext } from '../user/index.ts'

import type { CourseRecord } from './models.ts'
import { getCourseByCode, getCourseById, getCourses } from './service.ts'

interface CourseBlockInput {
	name: string
	goals: SkillId[]
}

interface CreateCourseInput {
	code: string
	name: string
	description?: string | null
	goals: SkillId[]
	goalWeights?: number[] | null
	startingPoints: SkillId[]
	setup?: SerializedSkillSetup | null
	organization?: string
	blocks?: CourseBlockInput[] | null
}

type UpdateCourseInput = Partial<CreateCourseInput>
type CourseContext = Pick<ApiContext, 'db' | 'isSignedIn' | 'loaders' | 'user' | 'userId'>
type AuthenticatedCourseContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'isAdmin' | 'isSignedIn' | 'loaders' | 'user' | 'userId'>

interface CourseResolverSource {
	record: CourseRecord
	mayViewSubscription: boolean
	mayViewTeachers: boolean
	mayViewStudents: boolean
}

function createCourseResolverSource(record: CourseRecord, { isSignedIn, user }: Pick<CourseContext, 'isSignedIn' | 'user'>): CourseResolverSource {
	return {
		record,
		mayViewSubscription: isSignedIn,
		mayViewTeachers: isSignedIn,
		mayViewStudents: isSignedIn && (record.courseSubscription?.role === 'teacher' || user?.role === 'admin'),
	}
}

function validateCourse(input: CreateCourseInput | UpdateCourseInput, current?: CourseRecord) {
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

export const courseResolvers = {
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

	Query: {
		allCourses: async (_source: unknown, _args: unknown, context: CourseContext) => (await getCourses(context.db, { ...(context.userId ? { userId: context.userId } : {}) })).map(course => createCourseResolverSource(course, context)),
		myCourses: async (_source: unknown, _args: unknown, context: AuthenticatedCourseContext) => {
			const { db, ensureSignedIn, userId } = context
			ensureSignedIn()
			return (await getCourses(db, { userId, onlyOwnCourses: true })).map(course => createCourseResolverSource(course, context))
		},
		course: async (_source: unknown, { code }: { code: string }, context: CourseContext) => createCourseResolverSource(await getCourseByCode(context.db, code, { ...(context.userId ? { userId: context.userId } : {}) }), context),
	},

	Mutation: {
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
	},
}
