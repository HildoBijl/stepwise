const DataLoader = require('dataloader')
const { Op } = require('sequelize')

module.exports = (db) => {
	return {
		courseTeachers: new DataLoader(async (courseIds) => {
			// Load all relevant teacher subscriptions.
			const subscriptions = await db.CourseSubscription.findAll({
				where: { courseId: { [Op.in]: courseIds }, role: "teacher" },
				include: [{ model: db.User, as: "user" }],
			})

			// Walk through the subscriptions and assign them to each course.
			const courseTeachers = {}
			subscriptions.forEach(sub => {
				if (!courseTeachers[sub.courseId])
					courseTeachers[sub.courseId] = []
				courseTeachers[sub.courseId].push(sub.user)
			})
			return courseIds.map(courseId => courseTeachers[courseId] || [])
		}),

		courseStudents: new DataLoader(async (courseIds) => {
			// Load all relevant student subscriptions.
			const subscriptions = await db.CourseSubscription.findAll({
				where: { courseId: { [Op.in]: courseIds }, role: "student" },
				include: [{ model: db.User, as: "user" }],
			})

			// Find the students for each respective course.
			const courseStudents = {}
			subscriptions.forEach(sub => {
				if (!courseStudents[sub.courseId])
					courseStudents[sub.courseId] = []
				courseStudents[sub.courseId].push(sub.user)
			})
			return courseIds.map(courseId => courseStudents[courseId] || [])
		})
	}
}
