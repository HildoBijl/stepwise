const { AuthenticationError } = require('apollo-server-express')

const { createLoaders } = require('../graphql')

function createApolloContext(database, pubsub) {
	return async ({ req }) => {
		// Determine whether there is a user.
		const userId = getIdFromRequest(req)
		const user = userId ? await database.User.findByPk(userId) : null

		// Set up a context object.
		const context = {
			// All database models.
			db: database,

			// Info about the user.
			isLoggedIn: !!user,
			isAdmin: user?.role === 'admin',
			userId,
			user,

			// Checks for the user that throw if not met.
			ensureLoggedIn: () => {
				if (!user) // Check the user, and not the userId. If the user is not in the database anymore, the userId may be truthy, but the user is not.
					throw new AuthenticationError('User not signed in.')
			},
			ensureAdmin: () => {
				if (user?.role !== 'admin')
					throw new AuthenticationError('No admin rights.')
			},
		}

		// Add some final details, like data loaders and a pubsub object.
		return {
			...context,

			// Loaders for the database.
			loaders: createLoaders(context),

			// The event bus for subscriptions.
			pubsub: pubsub,
		}
	}
}

/**
 * Returns the principal object or throws an error.
 */
function getIdFromRequest(request) {
	return request.session?.principal?.id
}

module.exports = {
	createApolloContext, getIdFromRequest
}
