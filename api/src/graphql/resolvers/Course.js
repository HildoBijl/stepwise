const { getAllCourses, getCourseByCode, getUserCourses, getCourseByCodeForUser, getCourseByIdForUser, createCourse, subscribeUserToCourse, unsubscribeUserFromCourse } = require('../util/Course')

const courseResolvers = {
}
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
			const userId = getCurrentUserId()
			return await subscribeUserToCourse(db, userId, courseId)
		},

		unsubscribeFromCourse: async (_source, { courseId }, { db, getCurrentUserId }) => {
			const userId = getCurrentUserId()
			return await unsubscribeUserFromCourse(db, userId, courseId)
		},
	},
}
module.exports = resolvers
