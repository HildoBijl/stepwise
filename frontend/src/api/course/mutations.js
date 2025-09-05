import { useCallback } from 'react'
import { useMutation, gql } from '@apollo/client'

import { useUserId } from '../user'

import { getCourseFields } from './queries'

export function useCreateCourseMutation(addTeachers = true, addStudents = true) {
	const [createCourse, data] = useMutation(CREATE_COURSE(addTeachers, addStudents))
	const newCreateCourse = input => createCourse({ variables: { input } })
	return [newCreateCourse, data]
}
const CREATE_COURSE = (addTeachers, addStudents) => gql`
	mutation createCourse($input: CreateCourseInput!) {
		createCourse(input: $input) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useSubscribeToCourseMutation(addTeachers = true, addStudents = true) {
	const userId = useUserId() // Needed for cache updates.
	const [subscribe, data] = useMutation(SUBSCRIBE_TO_COURSE(addTeachers, addStudents), {
		update(cache, { data }) {
			// Load the newly subscribed course.
			const newCourse = data?.subscribeToCourse
			if (!newCourse)
				return

			// Update the myCourses query.
			cache.modify({
				fields: {
					myCourses: (existingRefs = [], { readField }) => {
						const courseAlreadyInList = existingRefs.some(ref => readField("id", ref) === newCourse.id)
						if (courseAlreadyInList)
							return existingRefs
						const newCourseRef = cache.writeFragment({
							data: newCourse,
							fragment: gql`
              fragment NewCourse on CourseForStudent {
                id
                __typename
              }`,
						})
						return [...existingRefs, newCourseRef]
					},
				},
			})

			// Update the CourseForStudent query.
			cache.modify({
				id: cache.identify({ __typename: "CourseForStudent", id: newCourse.id }),
				fields: {
					role: () => "student",
				}
			})

			// Update the CourseForTeacher query.
			cache.modify({
				id: cache.identify({ __typename: "CourseForTeacher", id: newCourse.id }),
				fields: {
					role: () => "student",
					students: (existingRefs = [], { readField }) => {
						const studentAlreadyInList = existingRefs.some(ref => readField("id", ref) === userId)
						if (studentAlreadyInList)
							return existingRefs
						const userRef = cache.writeFragment({
							data: { id: userId, __typename: "UserPrivate" },
							fragment: gql`
                fragment NewStudent on UserPrivate {
                  id
                  __typename
                }
              `,
						})
						return [...existingRefs, userRef]
					},
				},
			})
		}
	})
	const subscribeToCourse = courseId => subscribe({ variables: { courseId } })
	return [subscribeToCourse, data]
}
const SUBSCRIBE_TO_COURSE = (addTeachers, addStudents) => gql`
	mutation subscribeToCourse($courseId: ID!) {
		subscribeToCourse(courseId: $courseId) {
			${getCourseFields(addTeachers, addStudents)}
		}
	}
`

export function useUnsubscribeFromCourseMutation(addTeachers = true, addStudents = true) {
	const userId = useUserId() // Needed for cache updates.
	const [unsubscribe, data] = useMutation(UNSUBSCRIBE_FROM_COURSE(addTeachers, addStudents), {
		update(cache, { data }) { // Add an update function to automatically update the myCourses query.
			// Load the newly subscribed course.
			const removedCourse = data?.unsubscribeFromCourse
			if (!removedCourse)
				return

			// Update the myCourses query.
			cache.modify({
				fields: {
					myCourses: (existingCourseRefs = [], { readField }) => existingCourseRefs.filter(courseRef => readField('id', courseRef) !== removedCourse.id),
				},
			})

			// Update the CourseForStudent and CourseForTeacher queries.
			cache.modify({
				id: cache.identify({ __typename: "CourseForStudent", id: removedCourse.id }),
				fields: {
					role: () => undefined,
					teachers: (existingRefs = [], { readField }) => existingRefs.filter(ref => readField("id", ref) !== userId),
				},
			})
			cache.modify({
				id: cache.identify({ __typename: "CourseForTeacher", id: removedCourse.id }),
				fields: {
					role: () => undefined,
					students: (existingRefs = [], { readField }) => existingRefs.filter(ref => readField("id", ref) !== userId),
					teachers: (existingRefs = [], { readField }) => existingRefs.filter(ref => readField("id", ref) !== userId),
				},
			})
		}
	})
	const unsubscribeFromCourse = courseId => unsubscribe({ variables: { courseId } })
	return [unsubscribeFromCourse, data]
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
