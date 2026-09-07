import type { CourseInfo, StudentCourseInfo, TeacherCourseInfo } from './types.ts'

export function isStudentCourse(course: CourseInfo): course is StudentCourseInfo {
	return course.subscription?.role === 'student'
}

export function isTeacherCourse(course: CourseInfo): course is TeacherCourseInfo {
	return course.subscription?.role === 'teacher'
}
