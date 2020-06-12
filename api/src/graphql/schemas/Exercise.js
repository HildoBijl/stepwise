const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Mutation {
		startExercise(skillId: String!): Exercise!
		submitExercise(skillId: String!, input: JSON!, skillIds: [String]): [Skill]!
		splitUpExercise(skillId: String!, skillIds: [String]): [Skill]!
		giveUpExercise(skillId: String!, skillIds: [String]): [Skill]!
	}

	type Exercise {
		id: String!
		state: JSON!
		active: Boolean!
		startedOn: DateTime!
		submissions: [Submission]!
	}
`

module.exports = schema
