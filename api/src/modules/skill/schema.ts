import { gql } from 'graphql-tag'

export const skillFields = `
	id: ID!
	userId: ID!
	skillId: String!
	numPracticed: Int!
	coefficients: [Float]!
	coefficientsOn: DateTime!
	highest: [Float]!
	highestOn: DateTime!
	createdAt: DateTime!
	updatedAt: DateTime!
`

export const skillTypeDefs = gql`
	extend interface UserSemiPrivate {
		skills(skillIds: [String]): [Skill]!
	}

	extend type UserPrivate {
		skills(skillIds: [String]): [Skill]!
	}

	extend type UserFull {
		skills(skillIds: [String]): [Skill]!
	}

	extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [Skill]!
	}

	extend type Subscription {
		skillsUpdated: [Skill]!
	}

	interface Skill {
		${skillFields}
	}

	type SkillWithoutExercises implements Skill {
		${skillFields}
	}
`
