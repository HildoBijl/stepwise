const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
	type Exercise {
		id: Int!
		name: String!
	}

	type Query {
		"Get all exercise categories"
		exercises: [Exercise]
	}
`

const resolvers = {
	Query: {
		exercises: async (_source, _args, { dataSources }) => dataSources.database.getAllExercises()
	},
}

const createServer = (database) => new ApolloServer({
	typeDefs,
	resolvers,
	dataSources: () => ({
		database
	}),
})

module.exports = {
	createServer
}
