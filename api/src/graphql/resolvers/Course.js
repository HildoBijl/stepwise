const { AuthenticationError } = require('apollo-server-express')

const { ensureValidCourseEndpoints, ensureValidCourseSetup, ensureValidCourseBlocks } = require('step-wise/eduTools')

const { getCourses, getCourseByCode, getCourseById } = require('../util/Course')

const courseForExternalResolvers = {}
const courseForStudentResolvers = {
	...courseForExternalResolvers,
	role: course => course.courseSubscription?.role,
	subscribedOn: course => course.courseSubscription?.createdAt,
	teachers: (course, _, { loaders }) => loaders.courseTeachers.load(course.id),
}
const courseForTeacherResolvers = {
	...courseForStudentResolvers,
	students: (course, _, { loaders }) => loaders.courseStudents.load(course.id),
}

const resolvers = {
	CourseForExternal: courseForExternalResolvers,
	CourseForStudent: courseForStudentResolvers,
	CourseForTeacher: courseForTeacherResolvers,
	Course: {
		__resolveType(course, { isLoggedIn, user }) {
			if (!isLoggedIn)
				return 'CourseForExternal'
			if (course.courseSubscription?.role === 'teacher' || user.role === 'admin')
				return 'CourseForTeacher'
			return 'CourseForStudent'
		}
	},

	Query: {
		allCourses: async (_source, { }, { db, userId }) => {
			return await getCourses(db, userId, false)
		},

		myCourses: async (_source, { }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			return await getCourses(db, userId, true)
		},

		course: async (_source, { code }, { db, userId }) => {
			return await getCourseByCode(db, code, userId)
		},
	},

	Mutation: {
		createCourse: async (_source, { input }, { db, ensureLoggedIn, user }) => {
			// Only registered teachers and admins may create courses. Check this.
			ensureLoggedIn()
			if (user.role !== 'teacher' && user.role !== 'admin')
				throw new AuthenticationError(`Invalid createCourse call: user does not have the rights to create a new course.`)

			// Check that the goals and starting points are valid for a course.
			const { goals, goalWeights, startingPoints, setup, blocks } = input
			const processedCourse = ensureValidCourseEndpoints(goals, startingPoints, goalWeights)
			ensureValidCourseSetup(processedCourse, setup, true)
			ensureValidCourseBlocks(processedCourse, blocks)

			// Set up the course.
			return await db.transaction(async (transaction) => {
				const { blocks, ...courseData } = input

				// Set up the course from the user's perspective and upgrade the courseSubscription to teacher.
				const course = await user.createCourse(courseData, { transaction })
				const result = await course.addParticipant(user, { through: { role: 'teacher' }, transaction })
				course.courseSubscription = result[0]

				// Add in the blocks.
				if (blocks) {
					const newBlocks = await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction })))
					course.blocks = newBlocks
				}
				return course
			})
		},

		updateCourse: async (_source, { courseId, input }, { db, ensureLoggedIn, user, isAdmin }) => {
			// Load the course. Ensure that the user is either a teacher of this course, or in general an admin.
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, user.id)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin)
				throw new AuthenticationError(`Invalid updateCourse call: user does not have the rights to edit the course with courseId "${courseId}".`)

			// Check that the goals and starting points are valid for a course.
			const goals = input.goals ?? course.goals
			const goalWeights = input.goalWeights ?? course.goalWeights
			const startingPoints = input.startingPoints ?? course.startingPoints
			const setup = input.setup ?? course.setup
			const blocks = input.blocks ?? course.blocks
			const processedCourse = ensureValidCourseEndpoints(goals, startingPoints, goalWeights)
			ensureValidCourseSetup(processedCourse, setup, true)
			ensureValidCourseBlocks(processedCourse, blocks)

			// If a course has been found matching the ID and that can be changed, adjust it.
			return await db.transaction(async (transaction) => {
				const { blocks, ...courseData } = input
				await course.update(courseData, { transaction })

				// If a new set of blocks was given in the input, overwrite them.
				if (input.blocks) {
					await course.setBlocks([]) // Destroy existing blocks.
					const newBlocks = await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction })))
					course.blocks = newBlocks
				}
				return course
			})
		},

		deleteCourse: async (_source, { courseId }, { db, ensureLoggedIn, user, isAdmin }) => {
			// Load the course. Ensure that the user is either a teacher of this course, or in general an admin.
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, user.id)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin)
				throw new AuthenticationError(`Invalid deleteCourse call: user does not have the rights to remove the course with courseId "${courseId}".`)

			// Remove the course. All links (students, blocks, etcetera) will be deleted in the subsequent cascade.
			await course.destroy()
			return true
		},

		subscribeToCourse: async (_source, { courseId }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, userId)
			const result = await course.addParticipant(userId)
			course.courseSubscription = result[0]
			return course
		},

		unsubscribeFromCourse: async (_source, { courseId }, { db, ensureLoggedIn, userId }) => {
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, userId)
			await course.removeParticipant(userId)
			course.courseSubscription = undefined
			return course
		},

		promoteToTeacher: async (_source, { courseId, userId }, { db, ensureLoggedIn, userId: currentUserId, isAdmin }) => {
			// Check access rights for this action.
			ensureLoggedIn()
			const course = await getCourseById(db, courseId, currentUserId)
			if (course.courseSubscription?.role !== 'teacher' && !isAdmin)
				throw new AuthenticationError(`Promotion to teacher failed: the user with ID "${currentUserId}" does not have the rights to assign teachers for the course with ID "${courseId}".`)

			// Update the course subscription.
			const [updatedCount] = await db.CourseSubscription.update(
				{ role: 'teacher' },
				{ where: { courseId, userId } },
			)
			if (updatedCount === 0)
				throw new Error(`Promotion to teacher failed: it seems that the user with userId "${userId}" is not subscribed to the course with courseId "${courseId}" and so cannot be promoted to teacher.`)

			// Load the course.
			return course
		},
	},
}
module.exports = resolvers
