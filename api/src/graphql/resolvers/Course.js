const { getAllCourses, getCourseByCode, getUserCourses, getCourseByCodeForUser, createCourse, subscribeUserToCourse, unsubscribeUserFromCourse } = require('../util/Course')

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
		createCourse: async (_source, { code, name, description, goals, startingPoints, setup }, { db, getCurrentUserId }) => {
			const userId = getCurrentUserId()
			return await createCourse(db, { code, name, description, goals, startingPoints, setup }, userId)
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
