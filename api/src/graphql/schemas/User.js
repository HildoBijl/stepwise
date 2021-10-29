import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
		me: User
		user(userId: ID!): User
		allUsers: [User]
  }

	extend type Mutation {
		acceptLatestPrivacyPolicy: PrivacyPolicyConsent!
		shutdownAccount(confirmEmail: String!): ID!
	}

	type PrivacyPolicyConsent {
		version: Int
		acceptedAt: DateTime
		isLatestVersion: Boolean!
	}

	type User {
		id: ID!
		name: String
		givenName: String
		familyName: String
		email: EmailAddress
		role: String!
		createdAt: DateTime!
		updatedAt: DateTime!
		skills(ids: [String]): [SkillWithoutExercises]!
		privacyPolicyConsent: PrivacyPolicyConsent!
	}
`
