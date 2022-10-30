const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		activeGroupExercises(code: String!): [GroupExercise]!
	}

	extend type Mutation {
		startGroupExercise(code: String!, skillId: String!): GroupExercise!
		submitGroupAction(code: String!, skillId: String!, action: JSON!): GroupExercise!
		cancelGroupAction(code: String!, skillId: String!): GroupExercise!
		resolveGroupEvent(code: String!, skillId: String!): GroupExercise!
	}

	extend type Subscription {
		activeGroupExercisesUpdate(code: String!): GroupExercise!
	}
	
	type GroupExercise {
		id: ID!
		skillId: String!
		exerciseId: String!
		state: JSON!
		active: Boolean!
		startedOn: DateTime!
		progress: JSON
		history: [GroupEvent]!
	}
	
	type GroupEvent {
		id: ID!
		progress: JSON
		performedAt: DateTime!
		actions: [GroupAction]!
	}

	type GroupAction {
		id: ID!
		userId: ID!
		action: JSON!
		performedAt: DateTime!
	}
`

module.exports = schema
