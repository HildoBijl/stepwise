const { AuthenticationError } = require('apollo-server-express')

function createApolloContext(database, pubsub) {
	return ({ req }) => ({
		/**
		 * All database models
		 */
		db: database,

		/**
		 * The event bus for subscriptions
		 */
		pubsub: pubsub,

		/**
		 * Returns the id of the currently logged in user, or throws an error otherwise.
		 * Beware: this doesn’t guarantee you that the user still exists in the DB!
		 */
		getCurrentUserId: () => {
			const principal = getPrincipalOrThrow(req)
			return principal.id
		},

		/**
		 * Returns the currently logged in user object, or throws an error otherwise.
		 */
		getCurrentUser: async () => {
			const principal = getPrincipalOrThrow(req)
			const user = await database.User.findByPk(principal.id)
			if (!user) {
				throw new AuthenticationError('No such user in the system.')
			}
			return user
		},

		/**
		 * Throws an error, if the user is not logged in.
		 * Note: this doesn’t check whether the user still exists in the DB!
		 */
		ensureLoggedIn: () => {
			getPrincipalOrThrow(req) // Just call this for the check
		},

		/**
		 * Throws an error, if the user is not an admin.
		 */
		ensureAdmin: async () => {
			const principal = getPrincipalOrThrow(req)
			const user = await database.User.findByPk(principal.id)
			if (user.role !== 'admin')
				throw new AuthenticationError('No admin rights.')
		}
	})
}

/**
 * Returns the principal object or throws an error.
 */
function getPrincipalOrThrow(request) {
	if (!request.session.principal || !request.session.principal.id) {
		throw new AuthenticationError('No user is logged in.')
	}
	return request.session.principal
}

module.exports = {
	createApolloContext, getPrincipalOrThrow
}
