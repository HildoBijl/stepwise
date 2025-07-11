const { getUser } = require('./User')

// getAllCourses return the list of all available courses.
async function getAllCourses(db) {
	return await db.Course.findAll({
		include: [
			{ association: 'blocks' },
			{ association: 'teachers' },
		],
	})
}
module.exports.getAllCourses = getAllCourses

// getCourseByCode takes a course code and returns the corresponding course. It does this for anonymous users, so only limited data is loaded.
async function getCourseByCode(db, code) {
	const course = await db.Course.findOne({
		where: { code },
		include: [
			{ association: 'blocks' },
		],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})
	if (!course)
		throw new Error(`Failed to load course with code "${code}".`)
	return course
}
module.exports.getCourseByCode = getCourseByCode

// getUserCourses returns the list of courses that the given user is subscribed to (in any role).
async function getUserCourses(db, userId) {
	// Load the user with the associated courses.
	const userWithCourses = await db.User.findByPk(userId, {
		include: {
			association: 'courses',
			include: [
				{ association: 'blocks' },
				{ association: 'teachers' },
			],
		},
		order: [[{ model: db.Course, as: 'courses' }, { model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})

	// Extract the courses, check them and return them.
	const courses = userWithCourses?.courses
	if (!courses)
		throw new Error(`Failed to load courses of user with ID "${userId}".`)
	return courses
}
module.exports.getUserCourses = getUserCourses

// getCourseByCodeForUser takes a course code and returns the corresponding course. It does this from the perspective of a given user. If the user is marked as a teacher (indicated through an extra function argument) then student data is included too.
async function getCourseByCodeForUser(db, code, ...args) {
	return await getCourseByConditionsForUser(db, { code }, ...args)
}
module.exports.getCourseByCodeForUser = getCourseByCodeForUser

// getCourseByIdForUser takes a courseId and returns the corresponding course. It does this from the perspective of a given user. If the user is marked as a teacher (indicated through an extra function argument) then student data is included too.
async function getCourseByIdForUser(db, courseId, ...args) {
	return await getCourseByConditionsForUser(db, { id: courseId }, ...args)
}
module.exports.getCourseByIdForUser = getCourseByIdForUser

// getCourseByConditionsForUser takes a set of conditions for a course (like an ID, code or so) and looks up the corresponding course.
async function getCourseByConditionsForUser(db, conditions, userId, requireTeacherRole = false, addStudents = requireTeacherRole) {
	// Load the user with the associated courses.
	const userWithCourses = await db.User.findByPk(userId, {
		include: {
			association: 'courses',
			where: conditions,
			include: [
				...(!requireTeacherRole ? [] : [{ // If this is a teacher, only show this course if the user is a teacher of it.
					association: 'participants',
					where: { id: userId }, // The teacher must be among the participants ...
					through: { where: { role: 'teacher' } }, // ... with role of teacher.
					required: true, // This is a hard requirement: throw out the course if not the case.
					attributes: [], // We don’t need the current data in the result.
				}]),
				{ association: 'blocks' },
				{ association: 'teachers' },
				...(!addStudents ? [] : [{ association: 'students' }]), // For teachers, also load student data.
			],
		},
		order: [[{ model: db.Course, as: 'courses' }, { model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})

	// ToDo: for teacher mode, take the course and derive all skills related to it. Then, for those skillIds, and for all respective students, load in skill data.

	// Extract the course, check it and return it.
	const courses = userWithCourses?.courses
	if (!courses || courses.length === 0)
		throw new Error(`Failed to load the course with properties "${JSON.stringify(conditions)}" for the user with ID "${userId}". Does this course exist, and is this user a teacher of this course?`)
	return courses[0]
}

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

// createCourse creates a new course. Added is also a userId, who is creating the course. This will be the course's first teacher.
async function createCourse(db, courseData, userId, transaction) {
	// Check the user's rights.
	const user = await getUser(db, userId)
	if (!(user.role === 'teacher' || user.role === 'admin'))
		throw new Error(`Invalid rights: the user with ID ${userId} has role ${user.role} and is hence not allowed to create a course.`)

	// Set up the course from the user's perspective and upgrade the courseSubscription to teacher.
	const course = await user.createCourse(courseData, { transaction })
	await course.addParticipant(user, { through: { role: 'teacher' }, transaction })

	// All done. Return the course.
	course.blocks = [] // Add an empty blocks list.
	return course
}
module.exports.createCourse = createCourse
