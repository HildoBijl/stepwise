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
		}),

		hasStudentInCourse: new DataLoader(async (keys) => { // Key: currentUserId + ":" + targetUserId
			// Split the keys up into ID pairs.
			const pairs = keys.map(key => {
				const [currentUserId, targetUserId] = key.split(':')
				return { currentUserId, targetUserId }
			})

			// Collect all target userIds and currentUserIds.
			const currentUserIds = [...new Set(pairs.map(p => p.currentUserId))]
			const targetUserIds = [...new Set(pairs.map(p => p.targetUserId))]

			// Query CourseSubscriptions where currentUser is teacher and target user is student.
			const subscriptions = await db.CourseSubscription.findAll({
				where: {
					userId: { [Op.in]: currentUserIds },
					role: 'teacher'
				},
				include: [{
					model: db.Course,
					as: 'course',
					include: [{
						model: db.CourseSubscription,
						as: 'participants',
						where: { userId: { [Op.in]: targetUserIds }, role: 'student' },
						required: true,
					}]
				}]
			})

			// Create a map for fast look-up.
			const map = {}
			subscriptions.forEach(sub => {
				sub.course.participants.forEach(studentSub => {
					map[`${sub.userId}:${studentSub.userId}`] = true
				})
			})

			// Return boolean value for each key.
			return keys.map(k => !!map[k])
		}),
	}
}
