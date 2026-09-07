import { deserializeSetup } from '@step-wise/skill-setup'
import { CourseDefinition } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { userRecordToUser } from '../user/conversion.ts'
import { userWithSkillsRecordToUser } from '../skill/conversion.ts'

import type { CourseRecord, CourseWithStudentSkillsRecord } from './records.ts'
import type { CourseInfo, CourseInfoWithStudentSkills, CourseSubscription } from './types.ts'

function courseAccessRecordToSubscription(record: CourseRecord['accessData']): CourseSubscription | undefined {
	if (!record || (record.role === null && record.subscribedAt === null)) return undefined
	if (record.role === null || record.subscribedAt === null) throw new Error('Invalid course subscription: the role and subscription date must either both exist or both be absent.')
	return { role: record.role, subscribedAt: new Date(record.subscribedAt) }
}

function courseRecordToBaseInfo(record: CourseRecord): Omit<CourseInfo, 'students'> {
	const subscription = courseAccessRecordToSubscription(record.accessData)
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
		...(record.accessData?.teachers ? { teachers: record.accessData.teachers.map(userRecordToUser) } : {}),
		...(subscription ? { subscription } : {}),
	}
}

export function courseRecordToCourseInfo(record: CourseRecord): CourseInfo {
	return {
		...courseRecordToBaseInfo(record),
		...(record.teacherData ? { students: record.teacherData.students.map(userRecordToUser) } : {}),
	}
}

export function courseWithStudentSkillsRecordToCourseInfo(record: CourseWithStudentSkillsRecord): CourseInfoWithStudentSkills {
	return {
		...courseRecordToBaseInfo(record),
		...(record.teacherData ? { students: record.teacherData.students.map(userWithSkillsRecordToUser) } : {}),
	}
}
