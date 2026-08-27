import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express, { type Request, type RequestHandler, type Router } from 'express'

import { type GoogleAuthDatabase, type GoogleClient, AuthStrategy as GoogleAuthStrategy } from './google/index.ts'
import { type SurfConextAuthDatabase, type SurfConextClient, AuthStrategy as SurfConextAuthStrategy } from './surfConext/index.ts'

const INVALID_AUTHENTICATION = 'INVALID_AUTHENTICATION'
const INTERNAL_ERROR = 'INTERNAL_ERROR'

interface AuthConfig { homepageUrl: string }
interface AuthenticatedUserReference { id: string }
type AuthenticationDatabase = GoogleAuthDatabase & SurfConextAuthDatabase

export function createAuthRouter(config: AuthConfig, db: AuthenticationDatabase, clients: { surfConextClient: SurfConextClient; googleClient: GoogleClient }): Router {
	const router = express.Router()
	router.use(cookieParser())
	router.use(bodyParser.urlencoded({ extended: true }))

	const createLoginHandler = (getUser: (request: Request) => Promise<AuthenticatedUserReference | null>): RequestHandler => async (request, response) => {
		try {
			const user = await getUser(request)
			if (!user) return void response.redirect(`${config.homepageUrl}?error=${INVALID_AUTHENTICATION}`)
			request.session.principal = { id: user.id }
			const redirectPath = config.homepageUrl + (request.session.redirect || '')
			request.session.redirect = null
			response.redirect(redirectPath)
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	}

	router.get('/logout', (request, response) => request.session.destroy(() => response.redirect(config.homepageUrl)))

	const surfConext = new SurfConextAuthStrategy(db, clients.surfConextClient)
	router.get('/surfconext/login', createLoginHandler(request => surfConext.authenticateAndSync(request)))
	router.get('/surfconext/initiate', async (request, response) => {
		try {
			await regenerateSession(request)
			request.session.initiated = new Date()
			request.session.redirect = getValidRedirect(request.query.redirect)
			const providerUrl = await surfConext.initiate(request.session.id)
			if (!providerUrl) throw new Error('SurfConext did not provide an authorization URL.')
			response.redirect(providerUrl)
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})

	const google = new GoogleAuthStrategy(db, clients.googleClient)
	router.post('/google/login', createLoginHandler(request => google.authenticateAndSync(request)))
	router.get('/google/initiate', async (request, response) => {
		try {
			await regenerateSession(request)
			request.session.initiated = new Date()
			request.session.redirect = getValidRedirect(request.query.redirect)
			request.session.save(() => response.sendStatus(200))
		} catch (error) {
			console.error(error)
			response.redirect(`${config.homepageUrl}?error=${INTERNAL_ERROR}`)
		}
	})
	return router
}

function getValidRedirect(redirect: unknown): string | null {
	return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : null
}

function regenerateSession(request: Request): Promise<void> {
	return new Promise((resolve, reject) => request.session.regenerate(error => error ? reject(error) : resolve()))
}
