const express = require('express')

/**
 * Template for specifying the interface
 */
class AuthStrategyInterface {
	static INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
	static USER_NOT_FOUND = 'USER_NOT_FOUND'
	/**
	 * Authenticates the a request from a user against
	 * the authentication provider. Returns a user-id on
	 * success, throws otherwise.
	 *
	 * @param req							HTTP request
	 * @throws String					Error code
	 * @returns String				User-id
	 */
	async authenticate(req) {
		// This method must be overriden properly in sub-classes
		throw AuthStrategyInterface.INVALID_AUTHENTICATION
	}
}

/**
 * Invokes the auth strategy and triggers appropriate redirects
 *
 * @param authStrategy AuthStrategyInterface
 */
const createAuthHandler = (homepageUrl, authStrategy) => {
	const router = express.Router()

	router.get('/login', async (req, res) => {
		try {
			const userId = await authStrategy.authenticate(req)
			req.principal = {
				id: userId
			}
			req.session.initiated = new Date()
			res.redirect(homepageUrl)
		} catch (e) {
			const code = (typeof e === 'string') ? e : 'UNKNOWN_ERROR'
			res.redirect(`${homepageUrl}?error=${code}`)
		}
	})

	return router
}

module.exports = {
	createAuthHandler, AuthStrategyInterface
}
