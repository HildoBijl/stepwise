import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { typeDefs, resolvers } from '../graphql'

export function createApollo(database) {
	return new ApolloServer({
		typeDefs,
		resolvers,
		context: ({ req }) => ({
			/**
			 * All database models
			 */
			db: database,

			/**
			 * Returns the id of the currently logged in user, or throws an error otherwise.
			 * Beware: this doesn’t guarantee you that the user still exists in the DB!
			 */
			getCurrentUserId: () => {
				if (!req.session.principal || !req.session.principal.id)
					throw new AuthenticationError('No user is logged in.')
				return req.session.principal.id
			},

			/**
			 * Returns the currently logged in user object, or throws an error otherwise.
			 */
			getCurrentUser: async () => {
				if (!req.session.principal || !req.session.principal.id)
					throw new AuthenticationError('No user is logged in.')
				const user = await database.User.findByPk(req.session.principal.id)
				if (!user) {
					throw new AuthenticationError('No such user in the system.')
				}
				return user
			},

			/**
			 * Returns a boolean: is the user an admin.
			 */
			ensureAdmin: async () => {
				if (!req.session.principal)
					throw new AuthenticationError('No user is logged in.')
				const user = await database.User.findByPk(req.session.principal.id)
				if (user.role !== 'admin')
					throw new AuthenticationError('No admin rights.')
			}
		}),
		playground: {
			settings: {
				'request.credentials': 'same-origin'
			}
		}
	})
}
