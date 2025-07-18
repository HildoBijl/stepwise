const { gql } = require('apollo-server-express')

const Course = `
		id: ID!
		code: String!
		name: String!
		description: String
		goals: [String]!
		goalWeights: [Int]
		startingPoints: [String]!
		setup: JSON
		organization: String!
		blocks: [CourseBlock]!
`

const CourseForStudent = `
		${Course}
		role: String
		subscribedOn: DateTime!
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
		deleteCourse(courseId: ID!): Boolean!
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

	input CreateCourseInput {
		code: String!
		name: String!
		description: String
		goals: [String]!
		goalWeights: [Int]
		startingPoints: [String]!
		setup: JSON
		organization: String
  	blocks: [CourseBlockInput]
	}

	input UpdateCourseInput {
		code: String
		name: String
		description: String
		goals: [String]
		goalWeights: [Int]
		startingPoints: [String]
		setup: JSON
  	blocks: [CourseBlockInput]
	}

	type CourseBlock {
		name: String!
		goals: [String]!
	}

	input CourseBlockInput {
		name: String!
		goals: [String]!
	}
`

module.exports = schema
