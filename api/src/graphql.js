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
		exercises: async (_source, _args, { dataSources, getPrincipal }) => {
			if (!getPrincipal()) {
				return null
			}
			return await dataSources.database.Exercise.findAll({
				where: {
					UserId: getPrincipal().id
				},
			})
		},
		me: async (_source, _args, { dataSources, getPrincipal }) => {
			if (!getPrincipal()) {
				return null
			}
			return await dataSources.database.User.findByPk(getPrincipal().id)
		},
	},
}

module.exports = {
	typeDefs, resolvers
}
