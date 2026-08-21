import { gql } from 'graphql-tag'

export const groupExerciseTypeDefs = gql`
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
		mode: ExerciseMode!
		parameters: JSON!
		active: Boolean!
		startedOn: DateTime!
		state: JSON
		history: [GroupEvent]!
	}

	interface GroupEvent {
		id: ID!
		performedAt: DateTime!
		submissions: [GroupSubmission]!
	}

	type ResolvedGroupEvent implements GroupEvent {
		id: ID!
		state: JSON!
		performedAt: DateTime!
		submissions: [GroupSubmission]!
	}

	type PendingGroupEvent implements GroupEvent {
		id: ID!
		performedAt: DateTime!
		submissions: [GroupSubmission]!
	}

	type GroupSubmission {
		id: ID!
		userId: ID!
		action: JSON!
		performedAt: DateTime!
	}
`
