import { type SerializedSkillSetup, deserializeSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'
import { Course, validateCourseDiagnostics } from '@step-wise/course-definition'
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
type CourseContext = Pick<ApiContext, 'db' | 'isLoggedIn' | 'loaders' | 'user' | 'userId'>
type AuthenticatedCourseContext = Pick<AuthenticatedContext, 'db' | 'ensureLoggedIn' | 'isAdmin' | 'loaders' | 'user' | 'userId'>

const courseForUserResolvers = {
	role: (course: CourseRecord) => course.courseSubscription?.role,
	subscribedAt: (course: CourseRecord) => course.courseSubscription?.createdAt,
	teachers: (course: CourseRecord, _args: unknown, { loaders }: CourseContext) => loaders.courseTeachers.load(course.id),
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
	validateCourseDiagnostics(new Course(skillTree, data).diagnostics)
}

export const courseResolvers = {
	ExternalCourse: {},
	StudentCourse: courseForUserResolvers,
	TeacherCourse: { ...courseForUserResolvers, students: (course: CourseRecord, _args: unknown, { loaders }: CourseContext) => loaders.courseStudents.load(course.id) },
	Course: {
		__resolveType(course: CourseRecord, { isLoggedIn, user }: CourseContext) {
			if (!isLoggedIn) return 'ExternalCourse'
			return course.courseSubscription?.role === 'teacher' || user?.role === 'admin' ? 'TeacherCourse' : 'StudentCourse'
		},
	},

	Query: {
		allCourses: (_source: unknown, _args: unknown, { db, userId }: CourseContext) => getCourses(db, { ...(userId ? { userId } : {}) }),
		myCourses: (_source: unknown, _args: unknown, { db, ensureLoggedIn, userId }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			return getCourses(db, { userId, onlyOwnCourses: true })
		},
		course: (_source: unknown, { code }: { code: string }, { db, userId }: CourseContext) => getCourseByCode(db, code, { ...(userId ? { userId } : {}) }),
	},

	Mutation: {
		createCourse: async (_source: unknown, { input }: { input: CreateCourseInput }, { db, ensureLoggedIn, user }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			if (user.role !== 'teacher' && user.role !== 'admin') throw new ForbiddenError('Invalid createCourse call: user does not have the rights to create a new course.')
			validateCourse(input)
			return db.transaction(async transaction => {
				const { blocks, ...courseData } = input
				const course = await db.Course.create(courseData, { transaction })
				course.courseSubscription = await db.CourseSubscription.create({ courseId: course.id, userId: user.id, role: 'teacher' }, { transaction })
				course.blocks = blocks ? await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction }))) : []
				return course
			})
		},
		updateCourse: async (_source: unknown, { courseId, input }: { courseId: string; input: UpdateCourseInput }, { db, ensureLoggedIn, user, isAdmin }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, { userId: user.id })
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Invalid updateCourse call: user does not have the rights to edit the course with courseId "${courseId}".`)
			validateCourse(input, course)
			return db.transaction(async transaction => {
				const { blocks, ...courseData } = input
				await course.update(courseData, { transaction })
				if (blocks !== undefined) {
					await db.CourseBlock.destroy({ where: { courseId: course.id }, transaction })
					course.blocks = blocks ? await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction }))) : []
				}
				return course
			})
		},
		deleteCourse: async (_source: unknown, { courseId }: { courseId: string }, { db, ensureLoggedIn, user, isAdmin }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, { userId: user.id })
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Invalid deleteCourse call: user does not have the rights to remove the course with courseId "${courseId}".`)
			await course.destroy()
			return true
		},

		subscribeToCourse: async (_source: unknown, { courseId }: { courseId: string }, { db, ensureLoggedIn, userId }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, { userId })
			course.courseSubscription = await db.CourseSubscription.create({ courseId, userId })
			return course
		},
		unsubscribeFromCourse: async (_source: unknown, { courseId }: { courseId: string }, { db, ensureLoggedIn, userId }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, { userId })
			await db.CourseSubscription.destroy({ where: { courseId, userId } })
			delete course.courseSubscription
			return course
		},
		promoteToTeacher: async (_source: unknown, { courseId, userId }: { courseId: string; userId: string }, { db, ensureLoggedIn, userId: currentUserId, isAdmin }: AuthenticatedCourseContext) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, { userId: currentUserId })
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new ForbiddenError(`Promotion to teacher failed: the user with ID "${currentUserId}" does not have the rights to assign teachers for the course with ID "${courseId}".`)
			const [updatedCount] = await db.CourseSubscription.update({ role: 'teacher' }, { where: { courseId, userId } })
			if (updatedCount === 0) throw new Error(`Promotion to teacher failed: it seems that the user with userId "${userId}" is not subscribed to the course with courseId "${courseId}" and so cannot be promoted to teacher.`)
			return course
		},
	},
}
