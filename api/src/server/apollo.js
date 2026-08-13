const { AuthenticationError } = require('apollo-server-express')

const { createLoaders } = require('../graphql')

function createApolloContext(database, pubsub) {
	return async ({ req }) => {
		// Determine whether there is a user.
		const userId = getIdFromRequest(req)
		const user = userId ? await database.User.findByPk(userId) : null

		// Set up a context object.
		return {
			// All database models.
			db: database,

			// Info about the user.
			isLoggedIn: !!user,
			isAdmin: user?.role === 'admin',
			userId,
			user,

			// User property checks.
			ensureLoggedIn: () => {
				if (!user) throw new AuthenticationError('User not signed in.')
			},
			ensureAdmin: () => {
				if (user?.role !== 'admin') throw new AuthenticationError('No admin rights.')
			},

			// Loaders for the database.
			loaders: createLoaders(context),

			// The event bus for subscriptions.
			pubsub: pubsub,
		}
	}
}

function getIdFromRequest(request) {
	return request.session?.principal?.id
}

module.exports = {
	createApolloContext, getIdFromRequest
}
