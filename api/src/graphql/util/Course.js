const { getUser } = require('./User')

// getCourses extracts a list of courses. If a userId is given, it also adds subscription info. If the onlyOwnCourses flag is set to true, only the user's own courses are given.
async function getCourses(db, userId, onlyOwnCourses = false) {
	// Load in the courses.
	const courses = await db.Course.findAll({
		include: [
			...addParticipantAssociation(userId, onlyOwnCourses),
			{ association: 'blocks' },
		],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})

	// Add in the course subscriptions manually.
	courses.forEach(course => {
		course.courseSubscription = (course.participants || [])[0]?.courseSubscription
	})
	return courses
}
module.exports.getCourses = getCourses

// getCourse takes a "where" object for a sequelize query and returns the corresponding code. If a userId is given, participation info is added.
async function getCourse(db, where, userId) {
	// Load in the course.
	const course = await db.Course.findOne({
		where,
		include: [
			...addParticipantAssociation(userId, false),
			{ association: 'blocks' },
		],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})

	// If the course exists, add in subscription info and return it.
	if (!course)
		throw new Error(`Failed to load course with specifications "${JSON.stringify(where)}".`)
	course.courseSubscription = (course.participants || [])[0]?.courseSubscription
	return course
}

// getCourseByCode takes a course code and returns the corresponding course.
async function getCourseByCode(db, code, userId) {
	return await getCourse(db, { code }, userId)
}
module.exports.getCourseByCode = getCourseByCode

// getCourseById takes a courseId and returns the corresponding course.
async function getCourseById(db, courseId, userId) {
	return await getCourse(db, { id: courseId }, userId)
}
module.exports.getCourseById = getCourseById

// addParticipantAssociation is a supporter function that adds a Sequelize include to include the given user's participation within the course.
function addParticipantAssociation(userId, required = false) {
	return userId ? [{ // When a userId is given, add participation info.
		association: 'participants',
		where: { id: userId },
		required, // Do we require the user to be a participant?
	}] : []
}








// ToDo: check if the functions below are still needed?




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
	// When asking student data, it it always required to be a teacher.
	if (addStudents)
		requireTeacherRole = true

	// If we require a teacher, also check if the user is an admin.
	let isAdmin = false
	if (requireTeacherRole) {
		const user = await getUser(db, userId)
		isAdmin = (user.role === 'admin')
	}

	// Set up the participation requirement based on whether t
	let participationRequirements = []
	if (requireTeacherRole && !isAdmin)
		participationRequirements.push({
			association: 'participants',
			where: { id: userId }, // The teacher must be among the participants ...
			through: { where: { role: 'teacher' } }, // ... with role of teacher.
			required: true, // This is a hard requirement: throw out the course if not the case.
			attributes: [], // We don’t need the current data in the result.
		})

	// Load the user with the associated courses.
	const userWithCourses = await db.User.findByPk(userId, {
		include: {
			association: 'courses',
			where: conditions,
			include: [
				...participationRequirements,
				{ association: 'blocks' },
				{ association: 'teachers' },
				...(addStudents ? [{ association: 'students' }] : []),
			],
		},
		order: [[{ model: db.Course, as: 'courses' }, { model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})

	// ToDo: for teacher mode, take the course and derive all skills related to it. Then, for those skillIds, and for all respective students, load in skill data.

	// If a user subscribed to the course was found, process the results.
	if (userWithCourses) {
		// Extract the course, check it and return it.
		const courses = userWithCourses?.courses
		if (!courses || courses.length === 0)
			throw new Error(`Failed to load the course with properties "${JSON.stringify(conditions)}" for the user with ID "${userId}". Does this course exist, and is this user a teacher of this course?`)
		return courses[0]
	}

	// If the course cannot be found through the user, then this is because the user is not subscribed to the course. Load in the course separately. This could occur for non-signed-in users accessing a course, or for admins accessing a course they are not subscribed to.
	const course = await db.Course.findOne({
		where: conditions,
		include: [
			...participationRequirements,
			{ association: 'blocks' },
			{ association: 'teachers' },
			...(addStudents ? [{ association: 'students' }] : []),
		],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']], // Ensure blocks are sorted by their index.
	})
	if (!course)
		throw new Error(`Failed to load the course with properties "${JSON.stringify(conditions)}". Does this course exist?`)
	return course
}
