const { gql } = require('apollo-server-express')

// The SkillWithoutExercises only has data about how strong the student is at this skill.
const SkillWithoutExercises = `
		id: ID!
		skillId: String!
		numPracticed: Int!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
`

// The SkillWithExercises also contains exercises for this skill. What did the student do?
const SkillWithExercises = `
		${SkillWithoutExercises}
		exercises: [Exercise]!
		currentExercise: Exercise
`

const schema = gql`
  extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [Skill]!
  }

	extend type Subscription {
		skillsUpdate: [Skill]!
	}

	interface Skill {
		${SkillWithoutExercises}
	}

	type SkillWithoutExercises implements Skill {
		${SkillWithoutExercises}
	}

	type SkillWithExercises implements Skill {
		${SkillWithExercises}
	}
`

module.exports = schema
