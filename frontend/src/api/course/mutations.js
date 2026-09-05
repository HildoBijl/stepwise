import { useCallback } from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { getCourseFields } from './queries'

export function useCreateCourseMutation(addTeachers = true, addStudents = true) {
	const [createCourse, data] = useMutation(CREATE_COURSE(addTeachers, addStudents))
	return [input => createCourse({ variables: { input } }), data]
}

const CREATE_COURSE = (addTeachers, addStudents) => gql`
	mutation createCourse($input: CreateCourseInput!) {
		createCourse(input: $input) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useSubscribeToCourseMutation(addTeachers = true, addStudents = true) {
	const [subscribe, data] = useMutation(SUBSCRIBE_TO_COURSE(addTeachers, addStudents), {
		update(cache, { data }) {
			const newCourse = data?.subscribeToCourse
			if (!newCourse) return
			cache.modify({
				fields: {
					myCourses: (existingRefs = [], { readField }) => {
						if (existingRefs.some(ref => readField('id', ref) === newCourse.id)) return existingRefs
						const newCourseRef = cache.writeFragment({
							data: newCourse,
							fragment: gql`
								fragment NewCourse on Course {
									id
									__typename
								}
							`,
						})
						return [...existingRefs, newCourseRef]
					},
				},
			})
		},
	})
	return [courseId => subscribe({ variables: { courseId } }), data]
}

const SUBSCRIBE_TO_COURSE = (addTeachers, addStudents) => gql`
	mutation subscribeToCourse($courseId: ID!) {
		subscribeToCourse(courseId: $courseId) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useUnsubscribeFromCourseMutation(addTeachers = true, addStudents = true) {
	const [unsubscribe, data] = useMutation(UNSUBSCRIBE_FROM_COURSE(addTeachers, addStudents), {
		update(cache, { data }) {
			const removedCourse = data?.unsubscribeFromCourse
			if (!removedCourse) return
			cache.modify({
				fields: {
					myCourses: (existingCourseRefs = [], { readField }) => existingCourseRefs.filter(courseRef => readField('id', courseRef) !== removedCourse.id),
				},
			})
		},
	})
	return [courseId => unsubscribe({ variables: { courseId } }), data]
}

const UNSUBSCRIBE_FROM_COURSE = (addTeachers, addStudents) => gql`
	mutation unsubscribeFromCourse($courseId: ID!) {
		unsubscribeFromCourse(courseId: $courseId) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function usePromoteToTeacherMutation(courseId, addTeachers = true, addStudents = true) {
	const [promote, data] = useMutation(PROMOTE_TO_TEACHER(addTeachers, addStudents))
	const promoteToTeacher = useCallback(userId => promote({ variables: { courseId, userId } }), [promote, courseId])
	return [promoteToTeacher, data]
}

const PROMOTE_TO_TEACHER = (addTeachers, addStudents) => gql`
	mutation promoteToTeacher($courseId: ID!, $userId: ID!) {
		promoteToTeacher(courseId: $courseId, userId: $userId) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`
