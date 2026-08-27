import { gql } from 'graphql-tag'

import { skillFields } from '../skill/index.ts'

export const exerciseTypeDefs = gql`
	enum ExerciseMode {
		solo
		group
	}

	type SkillWithExercises implements Skill {
		${skillFields}
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
		mode: ExerciseMode!
		parameters: JSON!
		initialState: JSON!
		active: Boolean!
		startedAt: DateTime!
		state: JSON!
		lastAction: JSON
		lastActionAt: DateTime
		history: [ExerciseEvent]!
	}

	type ExerciseActionResult {
		updatedExercise: Exercise!
		updatedSkills: [Skill]!
	}

	type ExerciseEvent {
		id: ID!
		action: JSON!
		state: JSON!
		performedAt: DateTime!
	}
`
