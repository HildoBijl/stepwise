import type { SerializedSkillSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'

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

export type CourseRecord<StudentRecord extends UserRecord = UserRecord> = {
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
	subscription?: CourseSubscriptionRecord | null
	teachers?: UserRecord[] | null
	students?: StudentRecord[] | null
}

export type CourseWithStudentSkillsRecord = CourseRecord<UserWithSkillsRecord>
