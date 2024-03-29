const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		group(code: String!): Group
		groupExists(code: String!): Boolean!
		myActiveGroup: Group
		myGroups: [Group]
	}

	extend type Mutation {
		createGroup: Group!
		joinGroup(code: String!): Group!
		leaveGroup(code: String!): Boolean!
		activateGroup(code: String!): Group!
		deactivateGroup: Group
	}

	extend type Subscription {
		groupUpdate(code: String!): Group!
		myActiveGroupUpdate: Group!
		myGroupsUpdate: Group!
	}

	type Member {
		groupId: ID!
		userId: ID!
		name: String
		givenName: String
		familyName: String
		active: Boolean
		lastActivity: DateTime!
	}

	type Group {
		id: ID!
		code: String!
		members: [Member]
	}
`

module.exports = schema
