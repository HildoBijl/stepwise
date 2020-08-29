const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		skill(skillId: String!): Skill
		skills(skillIds: [String]): [SkillWithoutExercises]!
  }

	type Skill {
		id: ID!
		skillId: String!
		numPracticed: Int!,
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		exercises: [Exercise]!
		currentExercise: Exercise
	}

	type SkillWithoutExercises {
		id: ID!
		skillId: String!
		numPracticed: Int!,
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
	}
`

module.exports = schema
