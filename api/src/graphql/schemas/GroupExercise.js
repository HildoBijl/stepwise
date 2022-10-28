const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Mutation {
		startGroupExercise(skillId: String!): Exercise!
		submitGroupExerciseAction(skillId: String!, action: JSON!): Exercise!
		cancelGroupExerciseAction(skillId: String!): Exercise!
		resolveGroupExerciseAction(skillId: String!): Exercise!
	}

	type GroupExercise {
		id: ID!
		skillId: String!
		exerciseId: String!
		state: JSON!
		active: Boolean!
		startedOn: DateTime!
		progress: JSON!
		history: [GroupEvent]!
	}
	
	type GroupEvent {
		id: ID!
		progress: JSON!
		actions: [GroupExerciseAction]!
		performedAt: DateTime!
	}

	type GroupExerciseAction {
		id: ID!
		user: User!
		action: JSON!
		performedAt: DateTime!
	}
`

module.exports = schema
