import { gql } from 'graphql-tag'

export const groupExerciseTypeDefs = gql`
	extend type Query {
		latestGroupExercise(code: String!, skillId: String!): GroupExercise
		groupExercise(id: ID!): GroupExercise
	}

	extend type Mutation {
		startGroupExercise(code: String!, skillId: String!): GroupExercise!
		submitGroupAction(code: String!, skillId: String!, action: JSON!): GroupExercise!
		cancelGroupAction(code: String!, skillId: String!): GroupExercise!
		resolveGroupEvent(code: String!, skillId: String!): GroupExercise!
	}

	extend type Subscription {
		latestGroupExerciseUpdated(code: String!, skillId: String!): GroupExercise!
	}

	type GroupExercise {
		id: ID!
		skillId: String!
		exerciseId: String!
		mode: ExerciseMode!
		parameters: JSON!
		initialState: JSON!
		active: Boolean!
		startedAt: DateTime!
		state: JSON
		history: [GroupEvent!]!
	}

	type GroupEvent {
		id: ID!
		state: JSON
		performedAt: DateTime!
		actions: [GroupExerciseAction!]!
	}

	type GroupExerciseAction {
		id: ID!
		userId: ID!
		action: JSON!
		performedAt: DateTime!
	}
`
