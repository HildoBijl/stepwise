import { gql, useQuery } from '@apollo/client'

import { skillFields, exerciseFields } from '../skill'

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
		${getCourseForStudentFields(addTeachers)}
	}
	... on CourseForTeacher {
		${getCourseForTeacherFields(addTeachers, addStudents, addSkills, addExercises)}
	}
`

const getCourseForStudentFields = (addTeachers) => `
		role
		subscribedOn
		${addTeachers ? `teachers {
			id
			name
			givenName
			familyName
		}` : ''}
`

const getCourseForTeacherFields = (addTeachers, addStudents, addSkills, addExercises) => {
	const skillsQuery = `skills {
		${skillFields}
		${addExercises ? `
		... on SkillWithExercises {
			exercises {
				${exerciseFields}
			}
			activeExercise {
				${exerciseFields}
			}
		}` : ``}
	}`
	return `
		${getCourseForStudentFields(addTeachers)}
		${addStudents ? `students {
			id
			name
			givenName
			familyName
			${addSkills ? `
			... on UserPrivate {
				${skillsQuery}
			}
			... on UserFull {
				${skillsQuery}
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
