const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		myGroups: [Group]
		group(code: String!): Group
	}

	extend type Mutation {
		createGroup: Group!
		deleteGroup(code: String!): Boolean!
		joinGroup(code: String!): Group!
		leaveGroup(code: String!): Boolean!
	}

	type Member {
		id: ID!
		name: String
	}

	type Group {
		id: ID!
		code: String!
		members: [Member]
	}
`

module.exports = schema
