const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		me: User
		user(id: ID!): User
		allUsers: [User]
  }

	type User {
		id: ID!
		name: String!
		givenName: String
		familyName: String
		email: EmailAddress!
		role: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		skills(ids: [String]): [SkillWithoutExercises]!
	}
`

module.exports = schema
