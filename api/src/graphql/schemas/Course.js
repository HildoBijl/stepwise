const { gql } = require('apollo-server-express')

const Course = `
		id: ID!
		code: String!
		name: String!
		description: String
		goals: [String]!
		startingPoints: [String]!
		setup: JSON
		blocks: [CourseBlock]!
`

const CourseForStudent = `
		${Course}
		role: String
		teachers: [UserPublic]!
`

const CourseForTeacher = `
		${CourseForStudent}
		students: [UserPrivate]!
`

const schema = gql`
	extend type Query {
		allCourses: [Course]!
		course(code: String!): Course!
		myCourses: [CourseForStudent]!
		courseForStudent(code: String!): CourseForStudent!
		courseForTeacher(code: String!): CourseForTeacher!
	}

	extend type Mutation {
		subscribeToCourse(courseId: ID!): CourseForStudent!
		unsubscribeFromCourse(courseId: ID!): CourseForStudent!
		createCourse(input: CreateCourseInput!): CourseForStudent!
		updateCourse(courseId: ID!, input: UpdateCourseInput!): CourseForStudent!
	}

	input CreateCourseInput {
		code: String!
		name: String!
		description: String
		goals: [String]!
		startingPoints: [String]!
		setup: JSON
	}

	input UpdateCourseInput {
		code: String
		name: String
		description: String
		goals: [String]
		startingPoints: [String]
		setup: JSON
	}

	type Course {
		${Course}
	}

	type CourseForStudent {
		${CourseForStudent}
	}

	type CourseForTeacher {
		${CourseForTeacher}
	}

	type CourseBlock {
		id: ID!
		name: String!
		goals: [String]!
		order: Int!
	}
`

module.exports = schema
