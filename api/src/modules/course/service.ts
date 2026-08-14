import { deserializeSetup } from '@step-wise/skill-setup'
import { Course as CourseDefinition } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import type { UserDatabase } from '../user/index.js'
import type { CourseBlockModel, CourseModel, CourseRecord, CourseSubscriptionModel } from './models.js'

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

export function dbCourseToCourseDefinition(course: CourseRecord): CourseDefinition {
	return new CourseDefinition(skillTree, {
		startingPoints: course.startingPoints,
		learningGoals: course.goals,
		goalWeights: course.goalWeights ?? undefined,
		blockGoals: course.blocks?.map(block => block.goals),
		setup: course.setup ? deserializeSetup(course.setup as any) : undefined,
	})
}
