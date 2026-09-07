import type { CourseDefinition, CourseSpecification } from '@step-wise/course-definition'

import type { ApiMutationResult, ApiOperationState, ApiQueryResult } from '../types.ts'
import type { User } from '../user/types.ts'
import type { UserWithSkills } from '../skill/types.ts'

export type CourseRole = 'student' | 'teacher'

export type CourseSubscription<Role extends CourseRole = CourseRole> = {
	role: Role
	subscribedAt: Date
}

export type CourseInfo<Student extends User = User> = {
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
	students?: Student[]
}

export type StudentCourseInfo = CourseInfo & { subscription: CourseSubscription<'student'> }
export type TeacherCourseInfo<Student extends User = User> = CourseInfo<Student> & { subscription: CourseSubscription<'teacher'> }
export type TeacherCourseInfoWithStudents<Student extends User = User> = TeacherCourseInfo<Student> & { students: Student[] }
export type SubscribedCourseInfo = StudentCourseInfo | TeacherCourseInfo
export type CourseInfoWithStudentSkills = CourseInfo<UserWithSkills>

export type CreateCourseInput = {
	code: string
	name: string
	description?: string
	organization?: string
	blockNames: readonly string[]
	specification: CourseSpecification
}

export type UseAvailableCoursesResult = ApiQueryResult<'courses', CourseInfo[]>
export type UseMyCoursesResult = ApiOperationState & {
	studentCourses: StudentCourseInfo[] | undefined
	teacherCourses: TeacherCourseInfoWithStudents[] | undefined
}
export type UseCourseResult = ApiQueryResult<'course', CourseInfoWithStudentSkills>

export type UseCreateCourseResult = ApiMutationResult<(input: CreateCourseInput) => Promise<void>>
export type UseSubscribeToCourseResult = ApiMutationResult<(courseId: string) => Promise<void>>
export type UseUnsubscribeFromCourseResult = ApiMutationResult<(courseId: string) => Promise<void>>
export type UsePromoteToTeacherResult = ApiMutationResult<(userId: string) => Promise<void>>
