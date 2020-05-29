const { gql } = require('apollo-server-express')

const typeDefs = gql`
	type Exercise {
		id: Int!
		name: String!
	}

	type User {
		name: String!
		email: String!
	}

	type Query {
		exercises: [Exercise]
		me: User
	}
`

const resolvers = {
	Query: {
		exercises: async (_source, _args, { dataSources }) =>
			await dataSources.database.Exercise.findAll(),
		me: (_source, _args, { getPrincipal }) => getPrincipal(),
	},
}

module.exports = {
	typeDefs, resolvers
}
