const { gql } = require('apollo-server-express')

const schema = gql`
	type SkillWithExercises implements Skill {
		id: ID!
		userId: ID!
		skillId: String!
		numPracticed: Int!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
		exercises: [Exercise]!
		activeExercise: Exercise
	}

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
