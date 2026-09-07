import type { CourseDefinition, CourseSpecification } from '@step-wise/course-definition'

import type { ApiMutationResult, ApiQueryResult } from '../types.ts'
import type { User } from '../user/types.ts'
import type { UserWithSkills } from '../skill/types.ts'

export type CourseRole = 'student' | 'teacher'

export type CourseSubscription = {
	role: CourseRole
	subscribedAt: Date
}

export type CourseInfo = {
	id: string
	code: string
	name: string
	description?: string
	organization: string
	blockNames: string[]
	createdAt: Date
	updatedAt: Date
	courseDefinition: CourseDefinition
	subscription?: CourseSubscription
	teachers?: User[]
	students?: User[]
}

export type SubscribedCourseInfo = CourseInfo & { subscription: CourseSubscription }
export type CourseInfoWithStudentSkills = Omit<CourseInfo, 'students'> & { students?: UserWithSkills[] }

export type CreateCourseInput = {
	code: string
	name: string
	description?: string
	organization?: string
	blockNames: readonly string[]
	specification: CourseSpecification
}

export type UseAvailableCoursesResult = ApiQueryResult<'courses', CourseInfo[]>
export type UseMyCoursesResult = ApiQueryResult<'courses', SubscribedCourseInfo[]>
export type UseCourseResult = ApiQueryResult<'course', CourseInfoWithStudentSkills>

export type UseCreateCourseResult = ApiMutationResult<(input: CreateCourseInput) => Promise<void>>
export type UseSubscribeToCourseResult = ApiMutationResult<(courseId: string) => Promise<void>>
export type UseUnsubscribeFromCourseResult = ApiMutationResult<(courseId: string) => Promise<void>>
export type UsePromoteToTeacherResult = ApiMutationResult<(userId: string) => Promise<void>>
