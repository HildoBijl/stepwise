const { gql } = require('apollo-server-express')

const schema = gql`
	extend type Query {
		myGroups: [Group]
		group(code: String!): Group
	}

	extend type Mutation {
		createGroup: Group!
		joinGroup(code: String!): Group!
		leaveGroup(code: String!): Boolean!
	}

	type Member {
		name: String
		givenName: String
		familyName: String
	}

	type Group {
		id: ID!
		code: String!
		members: [Member]
	}
`

module.exports = schema
