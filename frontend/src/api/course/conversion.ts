import { deserializeSetup } from '@step-wise/skill-setup'
import { CourseDefinition } from '@step-wise/course-definition'
import { skillTree } from '@step-wise/skill-tree'

import { userRecordToUser } from '../user/conversion.ts'
import { userWithSkillsRecordToUser } from '../skill/conversion.ts'

import type { CourseRecord, CourseWithStudentSkillsRecord } from './records.ts'
import type { CourseInfo, CourseInfoWithStudentSkills, CourseSubscription } from './types.ts'

function courseSubscriptionRecordToSubscription(record: CourseRecord['subscription']): CourseSubscription | undefined {
	if (!record) return undefined
	return { role: record.role, subscribedAt: new Date(record.subscribedAt) }
}

function courseRecordToBaseInfo(record: CourseRecord): Omit<CourseInfo, 'students'> {
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
		...(subscription ? { subscription } : {}),
	}
}

export function courseRecordToCourseInfo(record: CourseRecord): CourseInfo {
	return {
		...courseRecordToBaseInfo(record),
		...(record.students ? { students: record.students.map(userRecordToUser) } : {}),
	}
}

export function courseWithStudentSkillsRecordToCourseInfo(record: CourseWithStudentSkillsRecord): CourseInfoWithStudentSkills {
	return {
		...courseRecordToBaseInfo(record),
		...(record.students ? { students: record.students.map(userWithSkillsRecordToUser) } : {}),
	}
}
