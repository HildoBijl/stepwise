import { AuthenticationError } from '../../errors.ts'
import { Course, ensureValidCourseDiagnostics } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { getCourseByCode, getCourseById, getCourses } from './service.ts'

const courseForStudent = {
	role: (course: any) => course.courseSubscription?.role,
	subscribedOn: (course: any) => course.courseSubscription?.createdAt,
	teachers: (course: any, _args: unknown, { loaders }: any) => loaders.courseTeachers.load(course.id),
}

function validateCourse(input: any, current?: any) {
	const data = {
		startingPoints: input.startingPoints ?? current?.startingPoints,
		learningGoals: input.goals ?? current?.goals,
		goalWeights: input.goalWeights ?? current?.goalWeights,
		blockGoals: current ? input.blocks ?? current.blocks : input.blocks?.map((block: any) => block.goals),
		setup: input.setup ?? current?.setup,
	}
	ensureValidCourseDiagnostics(new Course(skillTree, data).diagnostics)
}

export const courseResolvers = {
	CourseForExternal: {},
	CourseForStudent: courseForStudent,
	CourseForTeacher: { ...courseForStudent, students: (course: any, _args: unknown, { loaders }: any) => loaders.courseStudents.load(course.id) },
	Course: {
		__resolveType(course: any, { isLoggedIn, user }: any) {
			if (!isLoggedIn) return 'CourseForExternal'
			return course.courseSubscription?.role === 'teacher' || user.role === 'admin' ? 'CourseForTeacher' : 'CourseForStudent'
		},
	},

	Query: {
		allCourses: (_source: unknown, _args: unknown, { db, userId }: any) => getCourses(db, userId),
		myCourses: (_source: unknown, _args: unknown, { db, ensureLoggedIn, userId }: any) => {
			ensureLoggedIn()
			return getCourses(db, userId, true)
		},
		course: (_source: unknown, { code }: { code: string }, { db, userId }: any) => getCourseByCode(db, code, userId),
	},

	Mutation: {
		createCourse: async (_source: unknown, { input }: any, { db, ensureLoggedIn, user }: any) => {
			ensureLoggedIn()
			if (user.role !== 'teacher' && user.role !== 'admin') throw new AuthenticationError('Invalid createCourse call: user does not have the rights to create a new course.')
			validateCourse(input)
			return db.transaction(async (transaction: any) => {
				const { blocks, ...courseData } = input
				const course = await user.createCourse(courseData, { transaction })
				const result = await course.addParticipant(user, { through: { role: 'teacher' }, transaction })
				course.courseSubscription = result[0]
				if (blocks) course.blocks = await Promise.all(blocks.map((block: any, index: number) => course.createBlock({ ...block, index }, { transaction })))
				return course
			})
		},
		updateCourse: async (_source: unknown, { courseId, input }: any, { db, ensureLoggedIn, user, isAdmin }: any) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, user.id)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new AuthenticationError(`Invalid updateCourse call: user does not have the rights to edit the course with courseId "${courseId}".`)
			validateCourse(input, course)
			return db.transaction(async (transaction: any) => {
				const { blocks, ...courseData } = input
				await course.update(courseData, { transaction })
				if (blocks) {
					await course.setBlocks([])
					course.blocks = await Promise.all(blocks.map((block: any, index: number) => course.createBlock({ ...block, index }, { transaction })))
				}
				return course
			})
		},
		deleteCourse: async (_source: unknown, { courseId }: any, { db, ensureLoggedIn, user, isAdmin }: any) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, user.id)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new AuthenticationError(`Invalid deleteCourse call: user does not have the rights to remove the course with courseId "${courseId}".`)
			await course.destroy()
			return true
		},
		
		subscribeToCourse: async (_source: unknown, { courseId }: any, { db, ensureLoggedIn, userId }: any) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, userId)
			course.courseSubscription = (await course.addParticipant(userId))[0]
			return course
		},
		unsubscribeFromCourse: async (_source: unknown, { courseId }: any, { db, ensureLoggedIn, userId }: any) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, userId)
			await course.removeParticipant(userId)
			course.courseSubscription = undefined
			return course
		},
		promoteToTeacher: async (_source: unknown, { courseId, userId }: any, { db, ensureLoggedIn, userId: currentUserId, isAdmin }: any) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, currentUserId)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin) throw new AuthenticationError(`Promotion to teacher failed: the user with ID "${currentUserId}" does not have the rights to assign teachers for the course with ID "${courseId}".`)
			const [updatedCount] = await db.CourseSubscription.update({ role: 'teacher' }, { where: { courseId, userId } })
			if (updatedCount === 0) throw new Error(`Promotion to teacher failed: it seems that the user with userId "${userId}" is not subscribed to the course with courseId "${courseId}" and so cannot be promoted to teacher.`)
			return course
		},
	},
}
