import type { SerializedSkillSetup } from '@step-wise/skill-setup'
import type { SkillId } from '@step-wise/module-tree-definition'

import type { ApiContext } from '../../types.ts'
import type { AuthenticatedContext } from '../../user/index.ts'

import type { CourseRecord } from '../models.ts'

export interface CourseBlockInput {
	name: string
	goals: SkillId[]
}

export interface CreateCourseInput {
	code: string
	name: string
	description?: string | null
	goals: SkillId[]
	goalWeights?: number[] | null
	startingPoints: SkillId[]
	setup?: SerializedSkillSetup | null
	organization?: string
	blocks?: CourseBlockInput[] | null
}

export type UpdateCourseInput = Partial<CreateCourseInput>
export type CourseContext = Pick<ApiContext, 'db' | 'isSignedIn' | 'loaders' | 'user' | 'userId'>
export type AuthenticatedCourseContext = Pick<AuthenticatedContext, 'db' | 'ensureSignedIn' | 'isAdmin' | 'isSignedIn' | 'loaders' | 'user' | 'userId'>

export interface CourseResolverSource {
	record: CourseRecord
	mayViewSubscription: boolean
	mayViewTeachers: boolean
	mayViewStudents: boolean
}
