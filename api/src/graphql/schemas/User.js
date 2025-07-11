const { gql } = require('apollo-server-express')

// What can you see from users when you know they exist on the site?
const UserPublic = `
		id: ID!
		name: String
		givenName: String
		familyName: String
`

// What can you see when people have given you permission to access their data?
const UserPrivate = `
		${UserPublic}
		email: EmailAddress
		skills(ids: [String]): [SkillLevel]!
`

// What data can you get for yourself?
const UserFull = `
		${UserPrivate}
		role: String!
		language: String
		createdAt: DateTime!
		updatedAt: DateTime!
		privacyPolicyConsent: PrivacyPolicyConsent!
`

const schema = gql`
  extend type Query {
		me: UserFull
		user(userId: ID!): UserPrivate
		allUsers: [UserPrivate]
  }

	extend type Mutation {
		setLanguage(language: String!): UserFull!
		acceptLatestPrivacyPolicy: PrivacyPolicyConsent!
		shutdownAccount(confirmEmail: String!): ID!
	}

	type PrivacyPolicyConsent {
		version: Int
		acceptedAt: DateTime
		isLatestVersion: Boolean!
	}

	type UserPublic {
		${UserPublic}
	}

	type UserPrivate {
		${UserPrivate}
	}

	type UserFull {
		${UserFull}
	}
`

module.exports = schema
