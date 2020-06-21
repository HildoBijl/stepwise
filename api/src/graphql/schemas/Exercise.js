const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Mutation {
		startExercise(skillId: String!): Exercise!
		processExerciseAction(skillId: String!, action: JSON!): ExerciseActionResult!
	}

	type Exercise {
		id: String!
		state: JSON!
		active: Boolean!
		startedOn: DateTime!
		progress: JSON!
		lastAction: Action
		actions: [Action]!
	}

	type ExerciseActionResult {
		updatedExercise: Exercise!
		adjustedSkills: [SkillWithoutExercises]!
	}
`

module.exports = schema
