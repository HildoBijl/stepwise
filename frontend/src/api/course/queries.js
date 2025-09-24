import { gql, useQuery } from '@apollo/client'

import { skillFields } from '../skill'

// Define the default fields we read for a course.
export const getCourseFields = (addTeachers, addStudents, addSkills, addExercises) => `
  __typename
	id
	code
	name
	description
	organization
	goals
	goalWeights
	startingPoints
	setup
	blocks {
		name
		goals
	}
	createdAt
	updatedAt
	... on CourseForStudent {
		${courseForStudentFields(addTeachers)}
	}
	... on CourseForTeacher {
		${courseForTeacherFields(addTeachers, addStudents, addSkills, addExercises)}
	}
`

const courseForStudentFields = (addTeachers) => `
		role
		subscribedOn
		${addTeachers ? `teachers {
			id
			name
			givenName
			familyName
		}` : ''}
`

const courseForTeacherFields = (addTeachers, addStudents, addSkills, addExercises) => {
	const privateFields = `
		email
		skills {
			${skillFields(addExercises)}
		}
	`
	return `
		${courseForStudentFields(addTeachers)}
		${addStudents ? `
		students {
			id
			name
			givenName
			familyName
			${addSkills ? `
			... on UserPrivate {
				${privateFields}
			}
			... on UserFull {
				${privateFields}
			}` : ``}
		}` : ''}
	`
}

export function useAllCoursesQuery(addTeachers = true, addStudents = false, addSkills = false, addExercises = false) {
	return useQuery(ALL_COURSES(addTeachers, addStudents, addSkills, addExercises))
}
export const ALL_COURSES = (addTeachers, addStudents, addSkills, addExercises) => gql`
	{
		allCourses {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`

export function useMyCoursesQuery(addTeachers = true, addStudents = false, addSkills = false, addExercises = false) {
	return useQuery(MY_COURSES(addTeachers, addStudents, addSkills, addExercises))
}
export const MY_COURSES = (addTeachers, addStudents, addSkills, addExercises) => gql`
	{
		myCourses {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`

export function useCourseQuery(code, addTeachers = true, addStudents = true, addSkills = true, addExercises = false) {
	return useQuery(COURSE(addTeachers, addStudents, addSkills, addExercises), { variables: { code } })
}
export const COURSE = (addTeachers, addStudents, addSkills, addExercises) => gql`
	query course($code: String!) {
		course(code: $code) {
			${getCourseFields(addTeachers, addStudents, addSkills, addExercises)}
		}
	}
`
