import { gql } from 'graphql-tag'

export const skillLevelFields = `
	numPracticed: Int!
	coefficients: [Float]!
	coefficientsOn: DateTime!
	highest: [Float]!
	highestOn: DateTime!
	createdAt: DateTime!
	updatedAt: DateTime!
`

export const skillTypeDefs = gql`
	extend type UserSharedData {
		skills(skillIds: [String]): [Skill]!
	}

	extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [Skill]!
	}

	extend type Subscription {
		skillsUpdated: [Skill]!
	}

	type Skill {
		id: ID!
		userId: ID!
		skillId: String!
		levelData: SkillLevelData!
	}

	type SkillLevelData {
		${skillLevelFields}
	}
`
