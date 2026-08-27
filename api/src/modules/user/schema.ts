import { gql } from 'graphql-tag'

const userPublicFields = `
	id: ID!
	name: String
	givenName: String
	familyName: String
`

const userPrivateFields = `
	${userPublicFields}
	email: EmailAddress
`

const userFullFields = `
	${userPrivateFields}
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
		deleteAccount(confirmEmail: String!): ID!
	}

	type PrivacyPolicyConsent {
		version: Int
		acceptedAt: DateTime
		isLatestVersion: Boolean!
	}

	interface User {
		${userPublicFields}
	}

	type UserPublic implements User {
		${userPublicFields}
	}

	interface UserSemiPrivate implements User {
		${userPrivateFields}
	}

	type UserPrivate implements UserSemiPrivate & User {
		${userPrivateFields}
	}

	type UserFull implements UserSemiPrivate & User {
		${userFullFields}
	}
`
