import { gql } from 'apollo-server-express'

const courseExternal = `
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

const courseStudent = `${courseExternal}
	role: String
	subscribedOn: DateTime
	teachers: [User]!
`

export const courseTypeDefs = gql`
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

	interface Course { ${courseExternal} }
	type CourseForExternal implements Course { ${courseExternal} }
	interface CourseForUser implements Course { ${courseStudent} }
	type CourseForStudent implements CourseForUser & Course { ${courseStudent} }
	type CourseForTeacher implements CourseForUser & Course {
		${courseStudent}
		students: [User]!
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
