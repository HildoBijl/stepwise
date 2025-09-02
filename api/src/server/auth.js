const express = require('express')
const { promisify } = require('util')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const SurfConextAuthStrategy = require('./surfConext/authStrategy').AuthStrategy
const GoogleAuthStrategy = require('./google/authStrategy').AuthStrategy

const INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
const INTERNAL_ERROR = 'INTERNAL_ERROR'

function createAuthRouter(config, database, { surfConextClient, googleClient }) {

	const authRouter = express.Router()
	authRouter.use(cookieParser())
	authRouter.use(bodyParser.urlencoded({ extended: true }))

	/**
	 * This factory creates a request handler that logs in a user, i.e. it creates a
	 * session and redirects the user to either the home page or their previous location.
	 * If `getUser` returns `null`, it is assumed that the authentication or verification
	 * failed, in which case it redirects the user to the home page with an error code.
	 * @param getUser A function with the following signature: async (req) => User | null
	 */
	function createLoginHandler(getUser) {
		return async function (req, res) {
			try {
				const user = await getUser(req)
				if (!user) {
					res.redirect(`${config.homepageUrl}?error=${INVALID_AUTHENTICATION}`)
					return
				}
				req.session.principal = {
					id: user.id,
				}
				const redirectPath = config.homepageUrl + (req.session.redirect || '')
				req.session.redirect = null
				res.redirect(redirectPath)
			} catch (error) {
				console.error(error)
				res.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
			}
		}
	}

	/**
	 * Logout route that destroys the session and redirects the user to the home page.
	 */
	authRouter.get('/logout', (req, res) => {
		req.session.destroy(() => {
			res.redirect(config.homepageUrl)
		})
	})

	/**
	 * SurfConext Authentication
	 * -------------------------
	 * Routes for initiating the SurfConext authentication and processing
	 * the response once the user comes back from SurfConext.
	 */
	const surfConextAuthStrategy = new SurfConextAuthStrategy(database, surfConextClient)
	authRouter.get('/surfconext/login', createLoginHandler(
		req => surfConextAuthStrategy.authenticateAndSync(req))
	)
	authRouter.get('/surfconext/initiate', async (req, res) => {
		try {
			await promisify(cb => req.session.regenerate(cb))()
			req.session.initiated = new Date()
			req.session.redirect = getValidRedirect(req.query.redirect)
			const authProviderUrl = await surfConextAuthStrategy.initiate(req.session.id)
			res.redirect(authProviderUrl)
		} catch (error) {
			console.error(error)
			res.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})

	/**
	 * Google Authentication
	 * ---------------------
	 * Routes for processing the response when the user logged in via Google.
	 * The initialization is entirely handled client-side by the Google JS library.
	 */
	const googleAuthStrategy = new GoogleAuthStrategy(database, googleClient)
	authRouter.post('/google/login', createLoginHandler(req => googleAuthStrategy.authenticateAndSync(req)))
	authRouter.get('/google/initiate', async (req, res) => {
		try {
			await promisify(cb => req.session.regenerate(cb))()
			req.session.initiated = new Date()
			req.session.redirect = getValidRedirect(req.query.redirect)
			req.session.save(() => res.sendStatus(200))
		} catch (error) {
			console.error(error)
			res.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})

	return authRouter
}

function getValidRedirect(rawRedirectParam) {
	if (typeof rawRedirectParam !== "string") return null
	if (rawRedirectParam.substr(0, 1) !== "/") return null
	return rawRedirectParam
}

module.exports = {
	createAuthRouter
}
