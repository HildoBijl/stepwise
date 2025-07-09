const { getAllCourses, getUserCourses, getCourseByCode, createCourse, subscribeUserToCourse, unsubscribeUserFromCourse } = require('../util/Course')

const resolvers = {
	Course: {

	},

	CourseBlock: {

	},

	CourseParticipant: {

	},

	Query: {
		allCourses: async (_source, { }, { db }) => {
			return await getAllCourses(db)
		},

		myCourses: async (_source, { }, { db, getCurrentUserId }) => {
			return await getUserCourses(db, getCurrentUserId())
		},

		course: async (_source, { code }, { db }) => {
			return await getCourseByCode(db, code)
		}
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
