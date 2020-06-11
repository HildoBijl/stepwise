const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Mutation {
		startExercise(skillId: String!): Exercise!
		submitExercise(skillId: String!, input: JSON!, skillIds: [String]): [Skill]!
		splitUpExercise(skillId: String!, skillIds: [String]): [Skill]!
		giveUpExercise(skillId: String!, skillIds: [String]): [Skill]!
	}

	enum ExerciseStatus { started solved split splitSolved givenUp }

	type Exercise {
		id: String!
		state: JSON!
		status: ExerciseStatus!
		startedOn: DateTime!
		submissions: [Submission]!
	}
`

module.exports = schema
