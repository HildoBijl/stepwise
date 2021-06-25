const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		me: User
		user(userId: ID!): User
		allUsers: [User]
  }

	extend type Mutation {
		shutdownAccount(confirmEmail: String!): ID!
	}

	type User {
		id: ID!
		name: String
		givenName: String
		familyName: String
		email: EmailAddress
		role: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		skills(ids: [String]): [SkillWithoutExercises]!
	}
`

module.exports = schema
