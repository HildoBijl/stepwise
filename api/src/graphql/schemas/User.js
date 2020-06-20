const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		me: User
  }

	type User {
		id: ID!
		name: String!
		email: EmailAddress!
		skills(ids: [String]): [SkillWithoutExercises]!
	}
`

module.exports = schema
