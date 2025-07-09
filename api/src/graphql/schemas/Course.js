const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		allCourses: [Course]!
		myCourses: [Course]!
		course(code: String!): Course
	}

	extend type Mutation {
		createCourse(code: String!, name: String!, description: String, goals: [String]!, startingPoints: [String]!, setup: JSON): Course!
		subscribeToCourse(courseId: ID!): Course!
		unsubscribeFromCourse(courseId: ID!): Course!
	}

	type Course {
		id: ID!
		code: String!
		name: String!
		description: String
		goals: [String]!
		startingPoints: [String]!
		setup: JSON
		blocks: [CourseBlock]!
	}

	type CourseBlock {
		id: ID!
		name: String!
		goals: [String]!
		order: Int!
	}

	type CourseParticipant {
		id: ID!
		name: String
		givenName: String
		familyName: String
		email: EmailAddress
		role: String!
		lastActivity: DateTime!
	}
`

module.exports = schema
