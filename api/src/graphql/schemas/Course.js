const { gql } = require('apollo-server-express')

const CourseForExternal = `
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
		createdAt: DateTime!
		updatedAt: DateTime!
`

const CourseForStudent = `
		${CourseForExternal}
		role: String
		subscribedOn: DateTime
		teachers: [UserPublic]!
`

const CourseForTeacher = `
		${CourseForStudent}
		students: [UserPrivate]!
`

const schema = gql`
	extend type Query {
		allCourses: [Course]!
		myCourses: [Course]!
		course(code: String!): Course!
	}

	extend type Mutation {
		createCourse(input: CreateCourseInput!): Course!
		updateCourse(courseId: ID!, input: UpdateCourseInput!): Course!
		deleteCourse(courseId: ID!): Boolean!
		subscribeToCourse(courseId: ID!): Course!
		unsubscribeFromCourse(courseId: ID!): Course!
		promoteToTeacher(courseId: ID!, userId: ID!): Course!
	}

	interface Course {
		${CourseForExternal}
	}

	type CourseForExternal implements Course {
		${CourseForExternal}
	}

	type CourseForStudent implements Course {
		${CourseForStudent}
	}

	type CourseForTeacher implements Course {
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
		organization: String
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
