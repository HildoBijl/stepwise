import DataLoader from 'dataloader'
import { Op } from 'sequelize'

import type { ApiContext, ApiLoaders } from '../types.js'
import type { UserRecord } from '../user/index.js'

import type { CourseDatabase } from './service.js'
import type { CourseRecord } from './models.js'

export function createCourseLoaders(context: ApiContext): ApiLoaders {
	const { db, userId } = context as { db: CourseDatabase; userId?: string }
	const usersByCourse = (role: 'teacher' | 'student') => new DataLoader<string, UserRecord[]>(async courseIds => {
		const subscriptions = await db.CourseSubscription.findAll({
			where: { courseId: { [Op.in]: courseIds }, role }, include: [{ model: db.User, as: 'user' }],
		})
		const users: Record<string, UserRecord[]> = {}
		subscriptions.forEach(subscription => {
			if (!users[subscription.courseId]) users[subscription.courseId] = []
			users[subscription.courseId].push(subscription.user)
		})
		return courseIds.map(courseId => users[courseId] ?? [])
	})

	return {
		courseTeachers: usersByCourse('teacher'),
		courseStudents: usersByCourse('student'),
		coursesWithStudent: new DataLoader<string, CourseRecord[]>(async studentIds => {
			const courses = await db.Course.findAll({
				include: [
					{ association: 'teachers', where: { id: userId }, required: true },
					{ association: 'students', where: { id: { [Op.in]: studentIds } }, required: true },
				],
			})
			const coursesByStudent: Record<string, CourseRecord[]> = {}
			courses.forEach(course => course.students?.forEach(student => {
				if (!coursesByStudent[student.id]) coursesByStudent[student.id] = []
				coursesByStudent[student.id].push(course)
			}))
			return studentIds.map(studentId => coursesByStudent[studentId] ?? [])
		}),
	}
}
