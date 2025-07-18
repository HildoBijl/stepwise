const { getAllCourses, getCourseByCode, getUserCourses, getCourseByCodeForUser, getCourseByIdForUser } = require('../util/Course')

const { ensureValidCourseEndpoints, ensureValidCourseSetup, ensureValidCourseBlocks } = require('step-wise/eduTools')

const courseResolvers = {}
const courseForStudentResolvers = {
	...courseResolvers,
	role: course => course.courseSubscription?.role,
}
const courseForTeacherResolvers = {
	...courseForStudentResolvers,
}

const resolvers = {
	Course: courseResolvers,
	CourseForStudent: courseForStudentResolvers,
	CourseForTeacher: courseForTeacherResolvers,
	CourseBlock: {},

	Query: {
		allCourses: async (_source, { }, { db }) => {
			return await getAllCourses(db)
		},

		course: async (_source, { code }, { db }) => {
			return await getCourseByCode(db, code)
		},

		myCourses: async (_source, { }, { db, getCurrentUserId }) => {
			return await getUserCourses(db, getCurrentUserId())
		},

		courseForStudent: async (_source, { code }, { db, getCurrentUserId }) => {
			return await getCourseByCodeForUser(db, code, getCurrentUserId())
		},

		courseForTeacher: async (_source, { code }, { db, getCurrentUserId }) => {
			return await getCourseByCodeForUser(db, code, getCurrentUserId(), true)
		},
	},

	Mutation: {
		createCourse: async (_source, { input }, { db, getCurrentUser }) => {
			// Check the user's rights.
			const user = await getCurrentUser()
			if (user.role !== 'teacher' && user.role !== 'admin')
				throw new Error(`Invalid createCourse call: user does not have the rights to create a new course.`)

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
				await course.addParticipant(user, { through: { role: 'teacher' }, transaction })

				// Add in the blocks.
				if (blocks) {
					const newBlocks = await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction })))
					course.blocks = newBlocks
				}
				return course
			})
		},

		updateCourse: async (_source, { courseId, input }, { db, getCurrentUser }) => {
			// Load the course. Ensure that the user is either an admin, or a teacher of the course.
			const user = await getCurrentUser()
			const requireTeacherRole = (user.role !== 'admin')
			const course = await getCourseByIdForUser(db, courseId, user.id, requireTeacherRole, false)

			// Check that the goals and starting points are valid for a course.
			const goals = input.goals || course.goals
			const goalWeights = input.goalWeights || course.goalWeights
			const startingPoints = input.startingPoints || course.startingPoints
			const setup = input.setup || course.setup
			const blocks = input.blocks || course.blocks
			const processedCourse = ensureValidCourseEndpoints(goals, startingPoints, goalWeights)
			ensureValidCourseSetup(processedCourse, setup, true)
			ensureValidCourseBlocks(processedCourse, blocks)

			// If a course has been found matching the ID and that can be changed, adjust it.
			return await db.transaction(async (transaction) => {
				if (!course)
					throw new Error(`Invalid course update call: cannot find a course with ID "${courseId}" that the current user with ID "${user.id}" is allowed to change.`)
				const { blocks, ...courseData } = input
				await course.update(courseData, { transaction })

				// Also update the blocks.
				if (blocks) {
					await course.setBlocks([]) // Destroy existing blocks.
					const newBlocks = await Promise.all(blocks.map((block, index) => course.createBlock({ ...block, index }, { transaction })))
					course.blocks = newBlocks
				}
				return course
			})
		},

		deleteCourse: async (_source, { courseId, input }, { db, getCurrentUser }) => {
			// Load the course. Ensure that the user is either an admin, or a teacher of the course.
			const user = await getCurrentUser()
			const requireTeacherRole = (user.role !== 'admin')
			const course = await getCourseByIdForUser(db, courseId, user.id, requireTeacherRole, false)

			// If a course has been found matching the ID and that can be changed, adjust it.
			if (!course)
				throw new Error(`Invalid course deletion cll: cannot find a course with ID "${courseId}" that the current user with ID "${user.id}" is allowed to change.`)
			await course.destroy()
			return true
		},

		subscribeToCourse: async (_source, { courseId }, { db, getCurrentUserId }) => {
			// Get the course, ensuring it exists.
			const userId = getCurrentUserId()
			const course = await db.Course.findByPk(courseId, { include: { association: 'blocks' } })
			if (!course)
				throw new Error(`Missing course: could not subscribe the user to the course with code "${courseCode}" since this course does not seem to exist.`)

			// Add the user to the course and return the result.
			await course.addParticipant(userId)
			return course
		},

		unsubscribeFromCourse: async (_source, { courseId }, { db, getCurrentUserId }) => {
			// Get the course, ensuring it exists.
			const userId = getCurrentUserId()
			const course = await db.Course.findByPk(courseId)
			if (!course)
				throw new Error(`Missing course: could not unsubscribe the user from the course with code "${courseCode}" since this course does not seem to exist.`)

			// Remove the user from the course and return the result.
			await course.removeParticipant(userId)
			return course
		},
	},
}
module.exports = resolvers
