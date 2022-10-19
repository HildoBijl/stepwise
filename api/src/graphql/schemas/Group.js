const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		myGroups: [Group]
		myActiveGroup: Group
		group(code: String!): Group
	}

	extend type Mutation {
		createGroup: Group!
		joinGroup(code: String!): Group!
		leaveGroup(code: String!): Boolean!
		activateGroup(code: String!): Group!
		deactivateGroup(code: String!): Group!
	}

	extend type Subscription {
		groupUpdate(code: String!): Group
		myGroupsUpdate: Group
	}

	type Member {
		groupId: ID!
		userId: ID!
		name: String
		givenName: String
		familyName: String
		active: Boolean
	}

	type Group {
		id: ID!
		code: String!
		members: [Member]
	}
`

module.exports = schema
