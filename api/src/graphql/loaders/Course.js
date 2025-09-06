const DataLoader = require('dataloader')
const { Op } = require('sequelize')

module.exports = ({ db, userId }) => ({
	// courseTeachers takes a courseId and loads all the teachers for that course.
	courseTeachers: new DataLoader(async courseIds => {
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

	// courseStudents takes a courseId and loads all the students for that course.
	courseStudents: new DataLoader(async courseIds => {
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

	// coursesWithStudent takes a studentId and loads the courses (taught by the current user) that the given student is a student at.
	coursesWithStudent: new DataLoader(async studentIds => {
		// Load all courses where the user is a teacher and at least one of the given students is a student.
		const courses = await db.Course.findAll({
			include: [
				{ association: 'teachers', where: { id: userId }, required: true },
				{ association: 'students', where: { id: { [Op.in]: studentIds } }, required: true },
			],
		})

		// Walk through the students in each course.
		const studentCourseMap = {}
		courses.forEach(course => {
			course.students.forEach(student => {
				if (!studentCourseMap[student.id])
					studentCourseMap[student.id] = []
				studentCourseMap[student.id].push(course)
			})
		})

		// Set up the list per student.
		return studentIds.map(studentId => studentCourseMap[studentId] || [])
	}),
})
