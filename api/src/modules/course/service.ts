import { deserializeSetup } from '@step-wise/skill-setup'
import { Course } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import type { UserDatabase } from '../user/index.ts'
import type { CourseBlockModel, CourseModel, CourseRecord, CourseSubscriptionModel } from './models.ts'

export interface CourseDatabase extends UserDatabase {
	Course: CourseModel
	CourseBlock: CourseBlockModel
	CourseSubscription: CourseSubscriptionModel
}

function participantAssociation(userId?: string, required = false) {
	return userId ? [{ association: 'participants', where: { id: userId }, required }] : []
}

export async function getCourses(database: CourseDatabase, userId?: string, onlyOwnCourses = false): Promise<CourseRecord[]> {
	const courses = await database.Course.findAll({
		include: [...participantAssociation(userId, onlyOwnCourses), { association: 'blocks' }],
		order: [[{ model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	courses.forEach(course => setCourseSubscription(course, course.participants?.[0]?.courseSubscription))
	return courses
}

async function getCourse(database: CourseDatabase, where: Record<string, unknown>, userId?: string): Promise<CourseRecord> {
	const course = await database.Course.findOne({
		where,
		include: [...participantAssociation(userId), { association: 'blocks' }],
		order: [[{ model: database.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	if (!course) throw new Error(`Failed to load course with specifications "${JSON.stringify(where)}".`)
	setCourseSubscription(course, course.participants?.[0]?.courseSubscription)
	return course
}

function setCourseSubscription(course: CourseRecord, subscription: CourseRecord['courseSubscription']): void {
	if (subscription) course.courseSubscription = subscription
	else delete course.courseSubscription
}

export function getCourseByCode(database: CourseDatabase, code: string, userId?: string): Promise<CourseRecord> {
	return getCourse(database, { code }, userId)
}
export function getCourseById(database: CourseDatabase, courseId: string, userId?: string): Promise<CourseRecord> {
	return getCourse(database, { id: courseId }, userId)
}

export function createCourseFromRecord(course: CourseRecord): Course {
	return new Course(skillTree, {
		startingPointIds: course.startingPoints,
		learningGoalIds: course.goals,
		...(course.goalWeights ? { learningGoalWeights: course.goalWeights } : {}),
		...(course.blocks ? { blockLearningGoalIds: course.blocks.map(block => block.goals) } : {}),
		...(course.setup ? { setup: deserializeSetup(course.setup) } : {}),
	})
}
