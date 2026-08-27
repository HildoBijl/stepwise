import { gql } from 'graphql-tag'

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
	subscribedAt: DateTime
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
	type ExternalCourse implements Course { ${courseExternal} }
	interface UserCourse implements Course { ${courseStudent} }
	type StudentCourse implements UserCourse & Course { ${courseStudent} }
	type TeacherCourse implements UserCourse & Course {
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
