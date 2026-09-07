import type { SerializedSkillSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/skill-definition'

import type { UserRecord } from '../user/records.ts'
import type { UserWithSkillsRecord } from '../skill/records.ts'

import type { CourseRole } from './types.ts'

export type CourseBlockRecord = {
	name: string
	goals: SkillId[]
}

export type CourseAccessDataRecord = {
	role: CourseRole | null
	subscribedAt: string | null
	teachers?: UserRecord[]
}

export type CourseTeacherDataRecord<StudentRecord extends UserRecord = UserRecord> = {
	students: StudentRecord[]
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
	accessData?: CourseAccessDataRecord | null
	teacherData?: CourseTeacherDataRecord<StudentRecord> | null
}

export type CourseWithStudentSkillsRecord = CourseRecord<UserWithSkillsRecord>
