const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Mutation {
		startExercise(skillId: String!): Exercise!
		submitExerciseAction(skillId: String!, action: JSON!): ExerciseActionResult!
	}

	type Exercise {
		id: ID!
		exerciseId: String!
		state: JSON!
		active: Boolean!
		startedOn: DateTime!
		progress: JSON!
		lastAction: JSON
		lastActionAt: DateTime
		history: [Event]!
	}

	type ExerciseActionResult {
		updatedExercise: Exercise!
		adjustedSkills: [Skill]!
	}
	
	type Event {
		id: ID!
		action: JSON!
		progress: JSON!
		performedAt: DateTime!
	}
`

module.exports = schema
