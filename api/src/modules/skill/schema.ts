import { gql } from 'apollo-server-express'

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
		skills(ids: [String]): [Skill]!
	}

	extend type UserPrivate {
		skills(ids: [String]): [Skill]!
	}

	extend type UserFull {
		skills(ids: [String]): [Skill]!
	}

	extend type Query {
		skill(skillId: String!, userId: ID): Skill
		skills(skillIds: [String]): [Skill]!
	}

	extend type Subscription {
		skillsUpdate: [Skill]!
	}

	interface Skill {
		${skillFields}
	}

	type SkillWithoutExercises implements Skill {
		${skillFields}
	}
`
