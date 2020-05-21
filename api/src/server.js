const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
	type Query {
		"Get all exercise categories"
		exercises: [String]
	}
`

const resolvers = {
	Query: {
		exercises: () => ['Mechanics', 'Biology'],
	},
}

const server = new ApolloServer({ typeDefs, resolvers })

module.exports = {
	server
}
