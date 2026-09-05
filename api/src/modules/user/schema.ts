import { gql } from 'graphql-tag'

const userPublicFields = `
	id: ID!
	name: String
	givenName: String
	familyName: String
`

const userSharedDataFields = `
	email: EmailAddress
`

const userAccountDataFields = `
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

	type User {
		${userPublicFields}
		sharedData: UserSharedData
		accountData: UserAccountData
	}

	type UserSharedData {
		${userSharedDataFields}
	}

	type UserAccountData {
		${userAccountDataFields}
	}
`
