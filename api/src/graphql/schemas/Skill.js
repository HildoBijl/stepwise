const { gql } = require('apollo-server-express')

const schema = gql`
  extend type Query {
		mySkills(ids: [String]): [Skill]
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
`

module.exports = schema
