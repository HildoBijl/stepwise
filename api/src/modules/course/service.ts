import { deserializeSetup } from '@step-wise/skill-setup'
import { Course } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import type { ServiceOptions } from '../types.ts'
import type { UserDatabase } from '../user/index.ts'

import type { CourseBlockModel, CourseModel, CourseRecord, CourseSubscriptionModel } from './models.ts'

export interface CourseDatabase extends UserDatabase {
	Course: CourseModel
	CourseBlock: CourseBlockModel
	CourseSubscription: CourseSubscriptionModel
}

interface ParticipantAssociationOptions {
	required?: boolean
	userId?: string
}

function participantAssociation({ userId, required = false }: ParticipantAssociationOptions = {}) {
	return userId ? [{ association: 'participants', where: { id: userId }, required }] : []
}

export interface GetCoursesOptions extends ServiceOptions {
	onlyOwnCourses?: boolean
	userId?: string
}

export async function getCourses(db: CourseDatabase, { userId, onlyOwnCourses = false, transaction }: GetCoursesOptions = {}): Promise<CourseRecord[]> {
	const courses = await db.Course.findAll({
		...(transaction ? { transaction } : {}),
		include: [...participantAssociation({ ...(userId ? { userId } : {}), required: onlyOwnCourses }), { association: 'blocks' }],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	courses.forEach(course => setCourseSubscription(course, course.participants?.[0]?.courseSubscription))
	return courses
}

export interface GetCourseOptions extends ServiceOptions {
	userId?: string
}

async function getCourse(db: CourseDatabase, where: Record<string, unknown>, { userId, transaction }: GetCourseOptions = {}): Promise<CourseRecord> {
	const course = await db.Course.findOne({
		...(transaction ? { transaction } : {}),
		where,
		include: [...participantAssociation({ ...(userId ? { userId } : {}) }), { association: 'blocks' }],
		order: [[{ model: db.CourseBlock, as: 'blocks' }, 'index', 'ASC']],
	})
	if (!course) throw new Error(`Failed to load course with specifications "${JSON.stringify(where)}".`)
	setCourseSubscription(course, course.participants?.[0]?.courseSubscription)
	return course
}

function setCourseSubscription(course: CourseRecord, subscription: CourseRecord['courseSubscription']): void {
	if (subscription) course.courseSubscription = subscription
	else delete course.courseSubscription
}

export function getCourseByCode(db: CourseDatabase, code: string, options: GetCourseOptions = {}): Promise<CourseRecord> {
	return getCourse(db, { code }, options)
}
export function getCourseById(db: CourseDatabase, courseId: string, options: GetCourseOptions = {}): Promise<CourseRecord> {
	return getCourse(db, { id: courseId }, options)
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
