import { gql } from 'apollo-server-express'

const userPublic = `
	id: ID!
	name: String
	givenName: String
	familyName: String
`

const userPrivate = `
	${userPublic}
	email: EmailAddress
`

const userFull = `
	${userPrivate}
	role: String!
	language: String
	createdAt: DateTime!
	updatedAt: DateTime!
	privacyPolicyConsent: PrivacyPolicyConsent!
`

export const userTypeDefs = gql`
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
		${userPublic}
	}

	type UserPublic implements User {
		${userPublic}
	}

	interface UserSemiPrivate implements User {
		${userPrivate}
	}

	type UserPrivate implements UserSemiPrivate & User {
		${userPrivate}
	}

	type UserFull implements UserSemiPrivate & User {
		${userFull}
	}
`
