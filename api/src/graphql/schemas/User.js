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
		skills(ids: [String]): [Skill]!
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
		me: User
		user(userId: ID!): User
		allUsers: [User]
  }

	extend type Mutation {
		setLanguage(language: String!): User!
		acceptLatestPrivacyPolicy: PrivacyPolicyConsent!
		shutdownAccount(confirmEmail: String!): ID!
	}

	type PrivacyPolicyConsent {
		version: Int
		acceptedAt: DateTime
		isLatestVersion: Boolean!
	}

	interface User {
		${UserPublic}
	}

	type UserPublic implements User {
		${UserPublic}
	}

	interface UserSemiPrivate implements User {
		${UserPrivate}
	}

	type UserPrivate implements UserSemiPrivate & User {
		${UserPrivate}
	}

	type UserFull implements UserSemiPrivate & User {
		${UserFull}
	}
`

module.exports = schema
