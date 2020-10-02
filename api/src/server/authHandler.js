const express = require('express')
const { promisify } = require('util')

/**
 * Template for specifying the interface
 * This class must be subclassed and its methods overriden
 */
class AuthStrategyTemplate {

	/**
	 * Initiates authentication (e.g. with authentication provider)
	 *
	 * @returns Promise<string>				Redirect URL
	 */
	async initiate(sessionId) {
		return null
	}

	/**
	 * Authenticates the a request from the client against
	 * the authentication provider. Returns user on success,
	 * otherwise `null`.
	 *
	 * @param req											HTTP request
	 * @returns Promise<User|null>	Provider-specific user data
	 */
	async authenticateAndRetrieve(req) {
		return null
	}
}

const INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
const INTERNAL_ERROR = 'INTERNAL_ERROR'

/**
 * Invokes the auth strategy and triggers appropriate redirects
 *
 * @param homepageUrl String
 * @param authStrategy AuthStrategyInterface instance
 * @returns express.Router instance
 */
const createAuthHandler = (homepageUrl, authStrategy) => {
	const router = express.Router()

	router.get('/login', async (req, res) => {
		try {
			const user = await authStrategy.authenticateAndSync(req)
			if (!user) {
				res.redirect(`${homepageUrl}?error=${INVALID_AUTHENTICATION}`)
				return
			}
			req.session.principal = {
				id: user.id,
			}
			const redirectPath = homepageUrl + (req.session.redirect || '')
			req.session.redirect = null
			res.redirect(redirectPath)
		} catch (e) {
			console.log(e)
			res.redirect(`${homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})

	router.get('/initiate', async (req, res) => {
		try {
			await promisify(cb => req.session.regenerate(cb))()
			req.session.initiated = new Date()
			req.session.redirect = getValidRedirect(req.query.redirect)
			const authProviderUrl = await authStrategy.initiate(req.session.id)
			res.redirect(authProviderUrl)
		} catch(e) {
			console.log(e)
			res.redirect(`${homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})

	return router
}

function getValidRedirect(rawRedirectParam) {
	if (typeof rawRedirectParam !== "string") return null
	if (rawRedirectParam.substr(0, 1) !== "/") return null
	return rawRedirectParam
}

module.exports = {
	createAuthHandler, AuthStrategyTemplate
}
