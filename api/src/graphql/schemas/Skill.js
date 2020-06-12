const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		skill(id: [String]): Skill!
		mySkills(ids: [String]): [SkillWithoutExercises]!
  }

	type Skill {
		id: String!
		name: String!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
		exercises: [Exercise]!
		currentExercise: Exercise
	}

	type SkillWithoutExercises {
		id: String!
		name: String!
		coefficients: [Float]!
		coefficientsOn: DateTime!
		highest: [Float]!
		highestOn: DateTime!
	}
`

module.exports = schema
