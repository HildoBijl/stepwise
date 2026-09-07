import { deserializeSetup } from '@step-wise/skill-setup'
import { CourseDefinition } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import type { UserRecord } from '../user/records.ts'
import type { User } from '../user/types.ts'
import { userRecordToUser } from '../user/conversion.ts'
import type { UserWithSkillsRecord } from '../skill/records.ts'
import type { UserWithSkills } from '../skill/types.ts'
import { userWithSkillsRecordToUser } from '../skill/conversion.ts'

import type { CourseRecord, CourseSubscriptionRecord, CourseWithStudentSkillsRecord, FullCourseRecord, MyCourseRecord } from './records.ts'
import type { CourseInfo, CourseInfoWithStudentSkills, CourseSubscription, StudentCourseInfo, TeacherCourseInfoWithStudents } from './types.ts'

type ConvertibleCourseRecord<StudentRecord extends UserRecord = UserRecord> = CourseRecord & Partial<FullCourseRecord<StudentRecord>>

function courseSubscriptionRecordToSubscription(record: CourseSubscriptionRecord | null | undefined): CourseSubscription | undefined {
	if (!record) return undefined
	return { role: record.role, subscribedAt: new Date(record.subscribedAt) }
}

function convertCourseRecord<StudentRecord extends UserRecord, Student extends User>(record: ConvertibleCourseRecord<StudentRecord>, convertStudent: (student: StudentRecord) => Student): CourseInfo<Student> {
	const subscription = courseSubscriptionRecordToSubscription(record.subscription)
	return {
		id: record.id,
		code: record.code,
		name: record.name,
		...(record.description === null ? {} : { description: record.description }),
		organization: record.organization,
		blockNames: record.blocks.map(block => block.name),
		createdAt: new Date(record.createdAt),
		updatedAt: new Date(record.updatedAt),
		courseDefinition: new CourseDefinition(skillTree, {
			learningGoalIds: record.goals,
			startingPointIds: record.startingPoints,
			...(record.goalWeights === null ? {} : { learningGoalWeights: record.goalWeights }),
			blockLearningGoalIds: record.blocks.map(block => block.goals),
			...(record.setup === null ? {} : { setup: deserializeSetup(record.setup) }),
		}),
		...(record.teachers ? { teachers: record.teachers.map(userRecordToUser) } : {}),
		...(record.students ? { students: record.students.map(convertStudent) } : {}),
		...(subscription ? { subscription } : {}),
	}
}

export function courseRecordToCourseInfo(record: ConvertibleCourseRecord): CourseInfo {
	return convertCourseRecord(record, userRecordToUser)
}

export function courseWithStudentSkillsRecordToCourseInfo(record: CourseWithStudentSkillsRecord): CourseInfoWithStudentSkills {
	return convertCourseRecord<UserWithSkillsRecord, UserWithSkills>(record, userWithSkillsRecordToUser)
}

export function courseRecordsToMyCourses(records: MyCourseRecord[]): { studentCourses: StudentCourseInfo[]; teacherCourses: TeacherCourseInfoWithStudents[] } {
	const studentCourses: StudentCourseInfo[] = []
	const teacherCourses: TeacherCourseInfoWithStudents[] = []
	records.forEach(record => {
		const course = courseRecordToCourseInfo(record)
		if (!course.subscription) throw new Error('Invalid own course: the current user does not have a subscription.')
		if (course.subscription.role === 'student') {
			studentCourses.push({ ...course, subscription: { ...course.subscription, role: 'student' } })
			return
		}
		if (course.subscription.role !== 'teacher') throw new Error(`Invalid own course: unknown subscription role "${course.subscription.role}".`)
		if (!course.students) throw new Error('Invalid teacher course: student data is missing.')
		teacherCourses.push({ ...course, subscription: { ...course.subscription, role: 'teacher' }, students: course.students })
	})
	return { studentCourses, teacherCourses }
}
