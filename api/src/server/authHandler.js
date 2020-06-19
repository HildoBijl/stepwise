const express = require('express')

/**
 * Template for specifying the interface
 * This class must be subclassed and its methods overriden
 */
class AuthStrategyTemplate {

	static INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
	static USER_NOT_FOUND = 'USER_NOT_FOUND'
	static UNKNOWN_ERROR = 'UNKNOWN_ERROR'

	/**
	 * Initiates authentication (e.g. with authentication provider)
	 *
	 * @returns string				Redirect URL
	 */
	async initiate(sessionId) {
		throw AuthStrategyInterface.UNKNOWN_ERROR
	}

	/**
	 * Authenticates the a request from the client against
	 * the authentication provider. Returns provider’s data on
	 * success, throws otherwise.
	 *
	 * @param req							HTTP request
	 * @returns object				Provider-specific user data
	 * @throws string					Error code (see above)
	 */
	async authenticate(req) {
		throw AuthStrategyInterface.INVALID_AUTHENTICATION
	}

	/**
	 * @param authData				Provider-specific user data
	 * @returns User					User object from database
	 * @throws string					Error code (see above)
	 */
	async login(authData) {
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

	router.get('/initiate', async (req, res) => {
		try {
			req.session.initiated = new Date()
			const redirectUrl = await authStrategy.initiate()
			res.redirect(redirectUrl)
		} catch(e) {
			console.log(e)
			res.redirect(`${homepageUrl}?error=${AuthStrategyTemplate.UNKNOWN_ERROR}`)
		}
	})

	router.get('/login', async (req, res) => {
		try {
			const authData = await authStrategy.authenticate(req)
			const user = await authStrategy.login(authData)
			req.session.principal = {
				id: user.id
			}
			req.session.initiated = new Date()
			res.redirect(homepageUrl)
		} catch (e) {
			let code = AuthStrategyTemplate.UNKNOWN_ERROR
			if (typeof e === 'string') {
				code = e
			} else {
				console.log(e)
			}
			res.redirect(`${homepageUrl}?error=${code}`)
		}
	})

	return router
}

module.exports = {
	createAuthHandler, AuthStrategyTemplate
}
