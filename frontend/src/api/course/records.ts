import type { SkillId } from '@step-wise/skill-definition'
import type { SerializedSkillSetup } from '@step-wise/skill-setup'

import type { UserRecord } from '../user/records.ts'
import type { UserWithSkillsRecord } from '../skill/records.ts'

import type { CourseRole } from './types.ts'

export type CourseBlockRecord = {
	name: string
	goals: SkillId[]
}

export type CourseSubscriptionRecord = {
	role: CourseRole
	subscribedAt: string
}

export type CourseRecord = {
	__typename: 'Course'
	id: string
	code: string
	name: string
	description: string | null
	goals: SkillId[]
	goalWeights: number[] | null
	startingPoints: SkillId[]
	setup: SerializedSkillSetup | null
	organization: string
	blocks: CourseBlockRecord[]
	createdAt: string
	updatedAt: string
}

export type CourseRecordWithSubscription = CourseRecord & {
	subscription: CourseSubscriptionRecord | null
}

export type MyCourseRecord = CourseRecordWithSubscription & {
	students: UserRecord[] | null
}

export type FullCourseRecord<StudentRecord extends UserRecord = UserRecord> = CourseRecordWithSubscription & {
	teachers: UserRecord[] | null
	students: StudentRecord[] | null
}

export type CourseWithStudentSkillsRecord = FullCourseRecord<UserWithSkillsRecord>
