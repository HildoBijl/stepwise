const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [SkillWithoutExercises]!
  }

	type Skill {
		id: ID!
		skillId: String!
		numPracticed: Int!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
		exercises: [Exercise]!
		currentExercise: Exercise
	}

	type SkillWithoutExercises {
		id: ID!
		skillId: String!
		numPracticed: Int!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		createdAt: DateTime!
		updatedAt: DateTime!
	}
`

module.exports = schema
