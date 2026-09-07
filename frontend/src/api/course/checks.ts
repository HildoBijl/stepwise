import type { User } from '../user/types.ts'

import type { CourseInfoWithStudents, StudentCourseInfo, TeacherCourseInfo } from './types.ts'

export function isStudentCourse(course: CourseInfoWithStudents): course is StudentCourseInfo {
	return course.subscription?.role === 'student' && course.students === undefined
}

export function isTeacherCourse<Student extends User>(course: CourseInfoWithStudents<Student>): course is TeacherCourseInfo<Student> {
	return course.subscription?.role === 'teacher' && course.students !== undefined
}
