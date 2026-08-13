import { Course as CourseDefinition } from '@step-wise/course-definition'
import { deserializeSetup } from '@step-wise/skill-setup'
import { skillTree } from '@step-wise/skill-tree'

import { getUser } from '../user'
import type { CourseBlockModel, CourseModel, CourseRecord, CourseSubscriptionModel } from './models'

export interface CourseDatabase {
	Course: CourseModel
	CourseBlock: CourseBlockModel
	CourseSubscription: CourseSubscriptionModel
	User: any
}

function participantAssociation(userId?: string, required = false) {
	return userId ? [{ association: 'participants', where: { id: userId }, required }] : []
}

export async function getCourses(database: CourseDatabase, userId?: string, onlyOwnCourses = false): Promise<CourseRecord[]> {
	const courses = await database.Course.findAll({
		include: [...participantAssociation(userId, onlyOwnCourses), { association: 'blocks' }],
		order: [[{ model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	courses.forEach(course => { course.courseSubscription = course.participants?.[0]?.courseSubscription })
	return courses
}

async function getCourse(database: CourseDatabase, where: Record<string, unknown>, userId?: string): Promise<CourseRecord> {
	const course = await database.Course.findOne({
		where,
		include: [...participantAssociation(userId), { association: 'blocks' }],
		order: [[{ model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	if (!course) throw new Error(`Failed to load course with specifications "${JSON.stringify(where)}".`)
	course.courseSubscription = course.participants?.[0]?.courseSubscription
	return course
}

export function getCourseByCode(database: CourseDatabase, code: string, userId?: string) {
	return getCourse(database, { code }, userId)
}
export function getCourseById(database: CourseDatabase, courseId: string, userId?: string) {
	return getCourse(database, { id: courseId }, userId)
}

export function dbCourseToCourseObject(course: CourseRecord): CourseDefinition {
	return new CourseDefinition(skillTree, {
		startingPoints: course.startingPoints,
		learningGoals: course.goals,
		goalWeights: course.goalWeights ?? undefined,
		blockGoals: course.blocks?.map(block => block.goals),
		setup: course.setup ? deserializeSetup(course.setup as any) : undefined,
	})
}

async function getCourseForUser(database: CourseDatabase, conditions: Record<string, unknown>, userId: string, requireTeacherRole = false, addStudents = requireTeacherRole) {
	if (addStudents) requireTeacherRole = true
	const isAdmin = requireTeacherRole && (await getUser(database, userId)).role === 'admin'
	const participationRequirements = requireTeacherRole && !isAdmin ? [{
		association: 'participants', where: { id: userId }, through: { where: { role: 'teacher' } }, required: true, attributes: [],
	}] : []
	const includes = [...participationRequirements, { association: 'blocks' }, { association: 'teachers' }, ...(addStudents ? [{ association: 'students' }] : [])]
	const user = await database.User.findByPk(userId, {
		include: { association: 'courses', where: conditions, include: includes },
		order: [[{ model: database.Course, as: 'courses' }, { model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	if (user) {
		if (!user.courses?.length) throw new Error(`Failed to load the course with properties "${JSON.stringify(conditions)}" for the user with ID "${userId}". Does this course exist, and is this user a teacher of this course?`)
		return user.courses[0]
	}
	const course = await database.Course.findOne({
		where: conditions,
		include: includes,
		order: [[{ model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	if (!course) throw new Error(`Failed to load the course with properties "${JSON.stringify(conditions)}". Does this course exist?`)
	return course
}

export function getCourseByCodeForUser(database: CourseDatabase, code: string, userId: string, requireTeacherRole = false, addStudents = requireTeacherRole) {
	return getCourseForUser(database, { code }, userId, requireTeacherRole, addStudents)
}

export function getCourseByIdForUser(database: CourseDatabase, courseId: string, userId: string, requireTeacherRole = false, addStudents = requireTeacherRole) {
	return getCourseForUser(database, { id: courseId }, userId, requireTeacherRole, addStudents)
}
