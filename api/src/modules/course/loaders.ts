import DataLoader from 'dataloader'
import { Op } from 'sequelize'

import type { LoaderContext } from '../types.ts'
import type { UserRecord } from '../user/index.ts'

import type { CourseRecord } from './models.ts'

export interface CourseLoaders {
	courseTeachers: DataLoader<string, UserRecord[]>
	courseStudents: DataLoader<string, UserRecord[]>
	coursesWithStudent: DataLoader<string, CourseRecord[]>
}

declare module '../types.ts' {
	interface ApiLoaders extends CourseLoaders {}
}

export function createCourseLoaders(context: LoaderContext): CourseLoaders {
	const { db, userId } = context
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
