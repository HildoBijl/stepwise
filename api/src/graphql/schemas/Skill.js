const { gql } = require('apollo-server-express')

// The SkillLevel only has data about how well the student is at this skill.
const SkillLevel = `
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

// The Skill also contains exercises for this skill. What did the student do?
const Skill = `
		${SkillLevel}
		exercises: [Exercise]!
		currentExercise: Exercise
`

const schema = gql`
  extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [SkillLevel]!
  }

	extend type Subscription {
		skillsUpdate: [SkillLevel]!
	}

	type SkillLevel {
		${SkillLevel}
	}

	type Skill {
		${Skill}
	}
`

module.exports = schema
