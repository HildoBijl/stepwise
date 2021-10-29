import { gql } from 'apollo-server-express'

export default gql`
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
		adjustedSkills: [SkillWithoutExercises]!
	}
`
