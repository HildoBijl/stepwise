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
			const user = await getCurrentUser()
			if (user.role !== 'teacher' && user.role !== 'admin')
				throw new Error(`Invalid createCourse call: user does not have the rights to create a new course.`)
			return await createCourse(db, input, user.id)
		},

		updateCourse: async (_source, { courseId, input }, { db, getCurrentUser }) => {
			// Load the course. Ensure that the user is either an admin, or a teacher of the course.
			const user = await getCurrentUser()
			const requireTeacherRole = (user.role !== 'admin')
			const course = await getCourseByIdForUser(db, courseId, user.id, requireTeacherRole, false)

			// If a course has been found matching the ID and that can be changed, adjust it.
			if (!course)
				throw new Error(`Invalid course update call: cannot find a course with ID "${courseId}" that the current user with ID "${user.id}" is allowed to change.`)
			await course.update(input)
			return course
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
