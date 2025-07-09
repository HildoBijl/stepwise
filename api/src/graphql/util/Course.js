const { getUser } = require('./User')

// getAllCourses return the list of all available courses.
async function getAllCourses(db) {
	return await db.Course.findAll({
		include: { association: 'blocks' },
	})
}
module.exports.getAllCourses = getAllCourses

// getUserWithCourses searches for a user and all its courses.
async function getUserWithCourses(db, userId) {
	return await db.User.findByPk(userId, {
		include: { association: 'courses' },
	})
}
module.exports.getUserWithCourses = getUserWithCourses

// getUserCourses returns the list of courses that the given user is subscribed to (in any role).
async function getUserCourses(db, userId) {
	const userWithCourses = await getUserWithCourses(db, userId)
	const courses = userWithCourses?.courses
	if (!courses)
		throw new Error(`Failed to load courses of user with ID "${userId}".`)
	return courses
}
module.exports.getUserCourses = getUserCourses

// getCourseByCode takes a course code and returns the corresponding course.
async function getCourseByCode(db, code) {
	return await db.Course.findOne({
		where: { code },
		include: { association: 'blocks' },
	})
}
module.exports.getCourseByCode = getCourseByCode

// createCourse creates a new course. Added is also a userId, who is creating the course. This will be the course's first teacher.
async function createCourse(db, courseData, userId) {
	// Check the user's rights.
	const user = await getUser(db, userId)
	if (!(user.role === 'teacher' || user.role === 'admin'))
		throw new Error(`Invalid rights: the user with ID ${userId} has role ${user.role} and is hence not allowed to create a course.`)

	// Set up the course from the user's perspective and upgrade the courseSubscription to teacher.
	const course = await user.createCourse(courseData)
	await course.addParticipant(user, { through: { role: 'teacher' } })

	// All done. Return the course.
	course.blocks = [] // Add an empty blocks list.
	return course
}
module.exports.createCourse = createCourse

// subscribeUserToCourse subscribes a user to an existing course.
async function subscribeUserToCourse(db, userId, courseId) {
	// Get the course, ensuring it exists.
	const course = await db.Course.findByPk(courseId, { include: { association: 'blocks' } })
	if (!course)
		throw new Error(`Missing course: could not subscribe the user to the course with code "${courseCode}" since this course does not seem to exist.`)

	// Add the user to the course and return the result.
	await course.addParticipant(userId)
	return course
}
module.exports.subscribeUserToCourse = subscribeUserToCourse

// unsubscribeUserFromCourse unsubscribes a user from a course.
async function unsubscribeUserFromCourse(db, userId, courseId) {
	// Get the course, ensuring it exists.
	const course = await db.Course.findByPk(courseId, { include: { association: 'blocks' } })
	if (!course)
		throw new Error(`Missing course: could not unsubscribe the user from the course with code "${courseCode}" since this course does not seem to exist.`)

	// Add the user to the course and return the result.
	await course.removeParticipant(userId)
	return course
}
module.exports.unsubscribeUserFromCourse = unsubscribeUserFromCourse
