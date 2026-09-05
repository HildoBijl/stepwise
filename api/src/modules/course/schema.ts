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

const courseAccess = `
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

	type Course {
		${courseExternal}
		accessData: CourseAccessData
		teacherData: CourseTeacherData
	}

	type CourseAccessData {
		${courseAccess}
	}

	type CourseTeacherData {
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
