const express = require('express')

/**
 * Template for specifying the interface
 */
class AuthStrategyInterface {

	static INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
	static USER_NOT_FOUND = 'USER_NOT_FOUND'

	/**
	 * Authenticates the a request from a user against
	 * the authentication provider. Returns data on
	 * success, throws otherwise.
	 *
	 * @param req							HTTP request
	 * @throws String					Error code
	 * @returns object				Provider-specific user data
	 */
	async authenticate(req) {
		// This method must be overriden properly in sub-classes
		throw AuthStrategyInterface.INVALID_AUTHENTICATION
	}

	async login(authData) {
		// This method must be overriden properly in sub-classes
		throw AuthStrategyInterface.USER_NOT_FOUND
	}

	async register(authData) {
		// This method must be overriden properly in sub-classes
		throw AuthStrategyInterface.USER_NOT_FOUND
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
			const authData = await authStrategy.authenticate(req)
			const userId = await authStrategy.login(authData)
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
